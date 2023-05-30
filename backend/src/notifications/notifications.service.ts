import { Model } from "mongoose";
import { InjectModel } from "@nestjs/mongoose";
import { NotificationDto } from "./dto/notificationDto";
import { SocketService } from "../socket/socket.service";
import { IUser } from "../user/interfaces/user.interface";
import { ConversationService } from "../conversation/conversation.service";
import { HttpException, HttpStatus, Inject, Injectable, forwardRef } from "@nestjs/common";
import NotificationsModel, { INotification, Notifications } from "./entities/notifications";

@Injectable()
export class NotificationsService {
    constructor(
        @Inject(forwardRef(() => SocketService))
        private readonly socketService: SocketService,
        @Inject(forwardRef(() => ConversationService))
        private readonly conversationService: ConversationService,
        @InjectModel(NotificationsModel.name) private readonly notificationsModel: Model<Notifications>
    ) {}

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

        await this.sendNotificationBySocket(notification.to, notification);

        return notification.save();
    }
    
    async removeNotificationById(notificationId: NotificationDto) {
        if(!notificationId) {
            throw new HttpException("\"notificationId\" field is incorrect!", HttpStatus.BAD_REQUEST);
        }

        const notification = await this.notificationsModel.findByIdAndRemove(notificationId);
        return notification.save();
    }

    async acceptNotification(notification: INotification) {
        if(!notification._id) {
            throw new HttpException(`Notification data is wrong! Missing \"id\" field!`, HttpStatus.BAD_REQUEST);
        }

        await this.notificationsModel.deleteMany({ conversationId: notification.conversationId, actionType: "conversationStaffAwaition" });
        
        return this.conversationService.connectStaffToConversation(notification.conversationId, notification.to);
    }

    async declineNotification(notification: INotification) {
        if(!notification._id) {
            throw new HttpException(`Notification data is wrong! Missing \"id\" field!`, HttpStatus.BAD_REQUEST);
        }

        await this.notificationsModel.deleteMany({ conversationId: notification.conversationId, actionType: "conversationStaffAwaition" });
    }

    async removeStaffAwaitionNotificationsByConversationId(conversationId: string) {
        if(!conversationId) {
            throw new HttpException(`Wrong conversationId: ${conversationId}!`, HttpStatus.BAD_REQUEST);
        }

        await this.notificationsModel.deleteMany({ conversationId, actionType: "conversationStaffAwaition" });
    }

    async sendNotificationsListUpdatingTrigger(userId: string) {
        if(!userId) {
            throw new HttpException(`Missing \"userId\" field!`, HttpStatus.BAD_REQUEST);
        }

        const userConnectionInstances = this.socketService.getAllUserConnectionInstances(userId);

        const sendTrigger = async (instanceIndex: number = 0) => {
            if(userConnectionInstances.length <= instanceIndex) {
                return;
            }

            await this.socketService.emitEvent(userConnectionInstances[instanceIndex].connection, "notification/list/update");
        }

        await sendTrigger();
    }

    async sendNotificationBySocket(userId: string, notification: INotification) {
        if(!userId) {
            throw new HttpException(`Missing \"userId\" field!`, HttpStatus.BAD_REQUEST);
        }

        if(!notification._id) {
            throw new HttpException(`Wrong \"notification\" data!`, HttpStatus.BAD_REQUEST);
        }

        const userConnectionInstances = this.socketService.getAllUserConnectionInstances(userId);

        const sendNotification = async (instanceIndex: number = 0) => {
            if(userConnectionInstances.length <= instanceIndex) {
                return;
            }

            await this.socketService.emitEvent(userConnectionInstances[instanceIndex].connection, "user/notification", notification);
        }

        await sendNotification();

        return notification;
    }
}
