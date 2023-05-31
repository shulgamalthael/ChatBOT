/* @nest.js */
import { Inject, Injectable, HttpException, HttpStatus, forwardRef } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";

/* @mongoose models */
import { User } from "./entities/user";

/* @mongoose */
import { Model } from "mongoose";
import { UserDto } from "./dto/user.dto";

/* @scripts */
import { spawnGuest } from "../../utils/scripts/spawner";
import { SocketService } from "../socket/socket.service";
import { fillUserData } from "../../utils/scripts/fillUserData";
import { IGenericObjectType } from "utils/interfaces/genericObjectType";
import { BotService } from "src/bot/bot.service";
import { IUser } from "./interfaces/user.interface";

@Injectable()
export class UserService {
	constructor(
		@InjectModel(User.name) private readonly userModel: Model<User>,
		@Inject(forwardRef(() => SocketService))
		private readonly socketService: SocketService,
		@Inject(forwardRef(() => BotService))
		private readonly botService: BotService,
	) {}

	async getUserById(userId: string, user: IUser) {
		let userData: IGenericObjectType = this.socketService.getUserById(userId, true);

		if(userId === user.businessId) {
			userData = await this.botService.getGeneralSettings(user);

			return {
				email: "",
				_id: userId,
				role: "system",
				businessId: userId,
				username: userData.botName,
				avatarUrl: userData.avatarUrl,
				created: new Date().toISOString(),
				lastVisit: new Date().toISOString(),
			}
		}

		if(userData) {
			return userData;
		}

		try {
			userData = await this.userModel.findById(userId).exec();
		} catch {}

		if(!userData) {
			throw new HttpException(`User #${userId} does not found!`, HttpStatus.BAD_REQUEST)
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

	async getStaffList(offset: string = "0") {
		let correctedOffset = parseInt(offset, 1);
		correctedOffset = correctedOffset - 1;
		correctedOffset = !correctedOffset ? 0 : correctedOffset;
		const limit = 25;

		const staffList = await this.userModel.find({ role: 'staff' }, {}, {skip: correctedOffset * limit, limit }).exec();

		if(!Array.isArray(staffList)) {
			return [];
		}

		return staffList.map((staff) => fillUserData(staff));
	}

	async getFullStaffList() {
		const staffList = await this.userModel.find({ role: 'staff' }).exec();

		if(!Array.isArray(staffList)) {
			return [];
		}

		return staffList.map((staff) => fillUserData(staff));
	}
}
