/* @nest.js */
import { Controller, Post, Get, Body, Res, Request, HttpCode, HttpStatus, Param, Query } from "@nestjs/common";

/* @dto */
import { UserDto } from "./dto/user.dto";

/* @interfaces */
import { IConnectedUser } from "src/socket/interfaces/connection.interface";

/* @services */
import { UserService } from "./user.service";
import { SocketService } from "../socket/socket.service";

/* @express */
import { Request as IRequest, Response as IResponse } from "express";

@Controller('api/user')
export class UserController {
	constructor(
		private readonly userService: UserService,
		private readonly socketService: SocketService,
	) {}

	@HttpCode(HttpStatus.OK)
	@Get('/byId/:id')
	getOnlineUser(@Param('id') id: string, @Request() request: IRequest) {
		const cookies = request.cookies;

		let user = cookies['wlc_cud'] || cookies['wlc_gud'] || '{}';
		user = JSON.parse(user);

		return this.userService.getUserById(id, user);
	}

	@HttpCode(HttpStatus.OK)
	@Get('/list')
	getOnlineUsersList(): IConnectedUser[] {
		return this.socketService.getUsersList();
	}

	@Get('/staff/list')
	getStaffList(@Query('offset') offset: string) {
		return this.userService.getStaffList(offset);
	}

	@HttpCode(HttpStatus.CREATED)
	@Post('/authorization')
	async processUserAuthorization(@Request() request: IRequest, @Res() response: IResponse, @Body() userDto: UserDto) {
		if(request.cookies['wlc_cud']) {
			const user = JSON.parse(request.cookies['wlc_cud']);

			if(!request.cookies['wlc_bid']) {
				response.cookie('wlc_bid', user.businessId, { sameSite: 'none', secure: true });
			}
			return response.json(user);
		}

		if(request.cookies['wlc_gud']) {
			const user = JSON.parse(request.cookies['wlc_gud']);
			
			if(!request.cookies['wlc_bid']) {
				response.cookie('wlc_bid', user.businessId, { sameSite: 'none', secure: true });
			}

			return response.json(user);
		}

		const user = await this.userService.processUserAuthorization(userDto);
		const isGuest = user.role === 'guest';

		if(!isGuest) {
			response.cookie('wlc_cud', JSON.stringify(user), { sameSite: 'none', secure: true });
		}

		if(isGuest) {
			response.cookie('wlc_gud', JSON.stringify(user), { sameSite: 'none', secure: true });
		}

		response.cookie('wlc_bid', user.businessId, { sameSite: 'none', secure: true });

		return response.json(user);
	}
}