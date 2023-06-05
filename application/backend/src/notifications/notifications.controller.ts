import { Controller, Get, Query, Request, Response } from "@nestjs/common";
import { NotificationsService } from "./notifications.service";
import { Request as IRequest, Response as IResponse } from "express";
import { UserCookies } from "utils/decorators/Cookie";
import { IUser } from "src/user/interfaces/user.interface";

@Controller("api/notifications")
export class NotificationsController {
    constructor(private readonly notificationsService: NotificationsService) {}

    @Get("/list")
    async getNotificationsList(@Query("offset") offset: string, @UserCookies() user: IUser | null) {
        return await this.notificationsService.getNotificationsList(user, offset);
    }

    @Get("/read")
    async readNotifications(@UserCookies() user: IUser | null) {
        return this.notificationsService.readNotificationsByUserId(user);
    }
}
