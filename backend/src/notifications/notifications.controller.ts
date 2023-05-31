import { Controller, Get, Query, Request, Response } from "@nestjs/common";
import { NotificationsService } from "./notifications.service";
import { Request as IRequest, Response as IResponse } from "express";

@Controller("api/notifications")
export class NotificationsController {
    constructor(private readonly notificationsService: NotificationsService) {}

    @Get("/list")
    async getNotificationsList(@Query("offset") offset: string, @Request() request: IRequest,  @Response() response: IResponse) {
        const cookies = request.cookies;
		let user = cookies['wlc_cud'] || cookies['wlc_gud'] || '{}';
		user = JSON.parse(user);

        return response.json(await this.notificationsService.getNotificationsList(user, offset));
    }

    @Get("/read")
    async readNotifications(@Request() request: IRequest) {
        const cookies = request.cookies;
		let user = cookies['wlc_cud'] || cookies['wlc_gud'] || '{}';
		user = JSON.parse(user);

        return this.notificationsService.readNotificationsByUserId(user);
    }
}
