import { Model } from "mongoose";
import { InjectModel } from "@nestjs/mongoose";
import { NotificationDto } from "./dto/notificationDto";
import { IUser } from "../user/interfaces/user.interface";
import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import NotificationsModel, { Notifications } from "./entities/notifications";

@Injectable()
export class NotificationsService {
    constructor(@InjectModel(NotificationsModel.name) private readonly notificationsModel: Model<Notifications>) {}

    async getNotificationsList(user: IUser, offset: string) {
        if(!user._id) {
            throw new HttpException("User's cookie does not exist!", HttpStatus.BAD_REQUEST);
        }

        let correctedOffset = parseInt(offset, 1);
        correctedOffset = correctedOffset - 1;
        correctedOffset = !correctedOffset ? 0 : correctedOffset;

        const limit = 25;

        const notificationsList = await this.notificationsModel.find({ to: user._id }, {}, { skip: correctedOffset * limit, limit }).exec();

        return notificationsList;
    }

    async addNotificationByUserId(notificationDto: NotificationDto, user: IUser) {
        if(!user._id) {
            throw new HttpException("User's cookie does not exist!", HttpStatus.BAD_REQUEST);
        }

        if(!notificationDto.title) {
            throw new HttpException("Notification's \"title\" field is incorrect!", HttpStatus.BAD_REQUEST);
        }

        if(!notificationDto.conversationId) {
            throw new HttpException("Notification's \"conversationId\" field is incorrect!", HttpStatus.BAD_REQUEST);
        }

        if(!notificationDto.from) {
            throw new HttpException("Notification's \"from\" field is incorrect!", HttpStatus.BAD_REQUEST);
        }

        if(!notificationDto.to) {
            throw new HttpException("Notification's \"to\" field is incorrect!", HttpStatus.BAD_REQUEST);
        }

        if(!notificationDto.actionType) {
            throw new HttpException("Notification's \"actionType\" field is incorrect!", HttpStatus.BAD_REQUEST);
        }

        const notification = await this.notificationsModel.create(notificationDto);
        return notification.save();
    }
    
    async removeNotificationById(notificationId: NotificationDto) {
        if(!notificationId) {
            throw new HttpException("\"notificationId\" field is incorrect!", HttpStatus.BAD_REQUEST);
        }

        const notification = await this.notificationsModel.findByIdAndRemove(notificationId);
        return notification.save();
    }
}