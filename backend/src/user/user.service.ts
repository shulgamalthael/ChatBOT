/* @nest.js */
import { Injectable, HttpException, HttpStatus } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";

/* @mongoose models */
import { User } from "./entities/user";

/* @mongoose */
import { Model } from "mongoose";
import { UserDto } from "./dto/user.dto";

/* @scripts */
import { spawnGuest } from "../../utils/scripts/spawner";
import { fillUserData } from "../../utils/scripts/fillUserData";

@Injectable()
export class UserService {
	constructor(@InjectModel(User.name) private readonly userModel: Model<User>) {}

	async processUserAuthorization(userDto: UserDto) {
		if(!userDto.businessId) {
			throw new HttpException('businessId does not exist', HttpStatus.BAD_REQUEST)
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

	async getStaffList(offset: string) {
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
}
