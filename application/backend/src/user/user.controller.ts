/* @nest.js */
import { Controller, Post, Get, Body, Res, Response, HttpCode, HttpStatus, Param, Query } from "@nestjs/common";

/* @dto */
import { UserDto } from "./dto/user.dto";

/* @services */
import { UserService } from "./user.service";

/* @express */
import { Request as IRequest, Response as IResponse } from "express";
import { generateId } from "utils/scripts/spawner";
import { IUser } from "./interfaces/user.interface";
import { Cookies, UserCookies } from "utils/decorators/Cookie";

const spawnStaff = (response: IResponse) => {
	const _id = generateId();
	const username = `staff#${_id.slice(0, 4)}`;

	const data = {
		_id,
		username,
		role: "staff",
		avatarUrl: null,
		businessId: "4444",
		email: `${username}@example.com`,
		createdAt: "2023-05-25T13:42:39.606Z",
		lastVisitAt: "2023-05-25T13:42:39.606Z",
	}

	response.clearCookie('wlc_gud');
	response.clearCookie('wlc_cud');
	response.clearCookie('wlc_src');
	
	response.cookie('wlc_bid', JSON.stringify(4444));
	response.cookie('wlc_cud', JSON.stringify(data));
	response.cookie('wlc_src', JSON.stringify(btoa("staff")));

	return response.json(data);
}

@Controller('api/user')
export class UserController {
	constructor(private readonly userService: UserService) {}

	@HttpCode(HttpStatus.OK)
	@Get('/byId/:id')
	getOnlineUser(@Param('id') id: string, @UserCookies() user: IUser) {
		return this.userService.getUserById(id, user.businessId);
	}

	@HttpCode(HttpStatus.OK)
	@Get('/list')
	getOnlineUsersList(@Query('offset') offset: string, @UserCookies() user: IUser) {
		return this.userService.getUsersList(offset, user.businessId);
	}

	@Get('/staff/list')
	getStaffList(@Query('offset') offset: string, @UserCookies() user: IUser) {
		return this.userService.getStaffList(offset, user.businessId);
	}

	@HttpCode(HttpStatus.CREATED)
	@Post('/authorization')
	async processUserAuthorization(
		@Res() response: IResponse, 
		@Body() userDto: UserDto,
		@UserCookies() user: IUser | undefined,
		@Cookies('wlc_src') roleSecret: string | undefined,
		@Cookies('wlc_bid') businessId: string | undefined,
	) {
		/* return spawnStaff(response); */

		let role = "guest";

		if(roleSecret) {
			role = atob(roleSecret);
		}

		const sendCookie = (name: string, value: any) => {
			const newValue = typeof value === "string" ? value : JSON.stringify(value);
			response.cookie(name, newValue, { sameSite: 'none', secure: true })
		};
		
		if(user) {
			if(user.role !== role) {
				user.role = role;
				sendCookie('wlc_cud', user);
			}

			if(!businessId) {
				sendCookie('wlc_bid', user.businessId);
			}

			return response.json(user);
		}

		const newUser = await this.userService.processUserAuthorization(userDto);
		const isGuest = newUser.role === 'guest';

		if(!isGuest) {
			sendCookie('wlc_cud', newUser);
		}

		if(isGuest) {
			sendCookie('wlc_gud', newUser);
		}

		sendCookie('wlc_src', btoa(newUser.role));
		sendCookie('wlc_bid', newUser.businessId);

		return response.json(newUser);
	}

	@Get("/role/change")
	async changeUserRole(@UserCookies() user: IUser, @Query('role') role: string, @Response() response: IResponse) {
		const updatedUser = await this.userService.changeUserRole(user._id, role);

		if(updatedUser.role === "guest") {
			response.clearCookie('wlc_gud');
			response.clearCookie('wlc_cud');
			response.cookie('wlc_gud', JSON.stringify(updatedUser))
		}

		if(updatedUser.role !== "guest") {
			response.clearCookie('wlc_gud');
			response.clearCookie('wlc_cud');
			response.cookie('wlc_cud', JSON.stringify(updatedUser))
		}

		return response.json(updatedUser);
	}

}