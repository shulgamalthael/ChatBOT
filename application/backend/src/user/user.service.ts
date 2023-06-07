/* @nest.js */
import { Inject, Injectable, HttpException, HttpStatus, forwardRef } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";

/* @mongoose models */
import { User } from "./entities/user";

/* @mongoose */
import { Model } from "mongoose";
import { UserDto } from "./dto/user.dto";

/* @scripts */
import { BotService } from "src/bot/bot.service";
import { IUser } from "./interfaces/user.interface";
import { spawnGuest } from "../../utils/scripts/spawner";
import { SocketService } from "../socket/socket.service";
import { fillUserData } from "../../utils/scripts/fillUserData";

@Injectable()
export class UserService {
	constructor(
		@InjectModel(User.name) private readonly userModel: Model<User>,
		@Inject(forwardRef(() => SocketService))
		private readonly socketService: SocketService,
		@Inject(forwardRef(() => BotService))
		private readonly botService: BotService,
	) {}

	async getUserById(userId: string, businessId: string, skipException: boolean = false) {
		if(userId === businessId) {
			const generalSettings = await this.botService.getGeneralSettings(businessId);

			return {
				email: "",
				_id: userId,
				role: "system",
				isOnline: true,
				businessId: userId,
				created: new Date().toISOString(),
				lastVisit: new Date().toISOString(),
				username: generalSettings.botName,
				avatarUrl: generalSettings.botAvatar,
			}
		}

		const onlineUsersList = this.socketService.getUsersList(businessId);
		const userDataDocument = this.socketService.getUserById(userId, true);
		let userData: IUser;

		if(userDataDocument) {
			userData = fillUserData(userDataDocument);
		}

		if(userData) {
			userData.isOnline = !!onlineUsersList.find((_user) => _user._id === userData._id);
			return fillUserData(userData);
		}

		try {
			userData = await this.userModel.findById(userId).exec();
		} catch {}

		if(!userData && !skipException) {
			throw new HttpException(`User #${userId} does not found!`, HttpStatus.BAD_REQUEST)
		}

		if(userData) {
			userData = fillUserData(userData);
			userData.isOnline = !!onlineUsersList.find((_user) => _user._id === userData._id);
		}

		return userData;
	}

	async processUserAuthorization(userDto: UserDto) {
		if(!userDto.businessId) {
			throw new HttpException('businessId does not exist', HttpStatus.BAD_REQUEST);
		}

		if(!userDto.email) {
			return spawnGuest(userDto.businessId);
		}

		if(!userDto.username) {
			throw new HttpException('username does not exist', HttpStatus.BAD_REQUEST)
		}
		
		let user = await this.userModel.findOne({ email: userDto.email }).exec();
		
		if(user) {
			return user;
		}

		const newUser = {
			...userDto,
			role: 'user',
			email: userDto.email,
			username: userDto.username,
			businessId: userDto.businessId,
			avatarUrl: userDto.avatarUrl || null,
			createdAt: new Date().toISOString(),
			lastVisitAt: new Date().toISOString()
		}

		user = await this.userModel.create(newUser);
		return user.save();
	}

	async getStaffList(offset: string = "0", businessId: string, withPagination: boolean = true): Promise<IUser[]> {
		const limit = 25;
		let paginationOffset = parseInt(offset, 1);
		paginationOffset = paginationOffset - 1;
		paginationOffset = paginationOffset || 0;

		const paginationConfig = (config) => withPagination
			?	config
			:	{}
		;

		let onlineUsersList = this.socketService.getUsersList(businessId);
		const filledOnlineUsersList = onlineUsersList
			.filter((_user) => _user.role === "staff" && _user.businessId === businessId)
			.slice(paginationOffset * limit, limit)
			.map((_user) => fillUserData(_user))
		;

		let result = [...filledOnlineUsersList];

		const extractUserData = async (index: number = 0) => {
			const nextLimit = limit - result.length;
			
			if(nextLimit > 0) {
				const usersList = await this.userModel.find({ role: "staff" }, {}, paginationConfig({ skip: paginationOffset * nextLimit, limit: nextLimit })).exec();

				const filledUsersList = usersList.map((user) => fillUserData(user));
				
				const usersMap = result.concat(filledUsersList).reduce((acc, user) => {
					if(!acc[user._id]) {
						acc[user._id] = user;
					}

					return acc;
				}, {});

				result = Object.values(usersMap);

				if(limit - result.length > 0 && !!usersList.length && withPagination) {
					paginationOffset += 1;
					return extractUserData(index + 1);
				}
			}

			return result.map((user) => {
				user.isOnline = !!onlineUsersList.find((_user) => _user._id === user._id);

				return user;
			});
		}

		return extractUserData();
	}

	async getFullStaffList(businessId: string) {
		return this.getStaffList("0", businessId, false);
	}

	async getUsersList(offset: string, businessId: string) {
		const limit = 25;
		let paginationOffset = parseInt(offset, 10);
		paginationOffset = paginationOffset - 1;
		paginationOffset = paginationOffset || 0;

		let onlineUsersList = this.socketService.getUsersList(businessId);
		
		const filledOnlineUsersList: IUser[] = onlineUsersList.map((user: IUser) => {
			user.isOnline = !!onlineUsersList.find((_user) => _user._id === user._id);

			return fillUserData(user);
		});

		let result = [...filledOnlineUsersList];
		result.map((user) => fillUserData(user));

		const extractUserData = async (index: number = 0) => {
			const nextLimit = limit - result.length;
			const usersList = await this.userModel.find({}, {}, { skip: paginationOffset * nextLimit, limit: nextLimit }).exec();

			const filledUsersList = usersList.map((user) => fillUserData(user));
			
			const usersMap = result.concat(filledUsersList).reduce((acc, user) => {
				if(!acc[user._id]) {
					acc[user._id] = user;
				}

				return acc;
			}, {});

			result = Object.values(usersMap);

			if(limit - result.length > 0 && !!usersList.length) {
				paginationOffset += 1;
				return extractUserData(index + 1);
			}

			return result.map((user) => {
				user.isOnline = !!onlineUsersList.find((_user) => _user._id === user._id);

				return user;
			});
		}

		return extractUserData();
	}

	async changeUserRole(userId: string, role: string) {
		if(!userId) {
			throw new HttpException("Invalid UserId", HttpStatus.BAD_REQUEST);
		}

		if(!role) {
			throw new HttpException("Invalid role", HttpStatus.BAD_REQUEST);
		}

		let user = await this.socketService.changeUserRole(userId, role);

		if(user) {
			return user;
		}

		try {
			user = await this.userModel.findById(userId).exec();
		} catch {}

		if(user) {
			user.role = role;
			return user.save();
		}

		throw new HttpException(`User #${userId} not found!`, HttpStatus.BAD_REQUEST);
	}
}
