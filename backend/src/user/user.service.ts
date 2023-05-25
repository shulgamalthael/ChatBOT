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
		
		let user = await this.userModel.findOne({ email: userDto.email }).exec();
		
		if(user) {
			return user;
		}

		const newUser = {
			...userDto,
			role: 'user',
			createdAt: new Date().toISOString(),
			lastVisitAt: new Date().toISOString()
		}

		user = await this.userModel.create(newUser);
		return user.save();
	}
}
