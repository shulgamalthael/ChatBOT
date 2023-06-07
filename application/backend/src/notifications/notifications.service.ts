import { Model } from "mongoose";
import { InjectModel } from "@nestjs/mongoose";
import { UserService } from "src/user/user.service";
import { NotificationDto } from "./dto/notificationDto";
import { SocketService } from "../socket/socket.service";
import { IUser } from "../user/interfaces/user.interface";
import { ConversationService } from "../conversation/conversation.service";
import { HttpException, HttpStatus, Inject, Injectable, forwardRef } from "@nestjs/common";
import NotificationsModel, { INotification, Notifications } from "./entities/notifications";

@Injectable()
export class NotificationsService {
    constructor(
        @Inject(forwardRef(() => UserService))
        private readonly userService: UserService,
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

    async addManyNotificationsByUserId(notifications: INotification[], user: IUser, notificationIndex: number = 0) {
        if(!Array.isArray(notifications) || notifications.length <= notificationIndex) {
            return;
        }

        const notification = notifications[notificationIndex];

        await this.addNotificationByUserId(notification, user);

        return this.addManyNotificationsByUserId(notifications, user, notificationIndex + 1);
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

        await this.sendNotificationBySocket(notification);

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

        const conversation = await this.conversationService.findConversationByIdIgnoreBelonging(notification.conversationId);

        if(conversation) {
            await this.notificationsModel.deleteMany({ conversationId: notification.conversationId, actionType: "conversationStaffAwaition" });

            const staffList = await this.userService.getFullStaffList(conversation.businessId);

            await this.sendMenyNotificationsListUpdateTriggers(staffList);

            return this.conversationService.connectStaffToConversation(notification.conversationId, notification.to);
        }
    }

    async declineNotification(notification: INotification) {
        if(!notification._id) {
            throw new HttpException(`Notification data is wrong! Missing \"id\" field!`, HttpStatus.BAD_REQUEST);
        }

        const conversation = await this.conversationService.findConversationByIdIgnoreBelonging(notification.conversationId);

        if(conversation) {
            await this.notificationsModel.deleteMany({ conversationId: notification.conversationId, actionType: "conversationStaffAwaition" });

            if(notification.actionType === "conversationStaffAwaition" && notification.staffList.length === 1 || notification.staffList.length === 0) {
                const staffList = await this.userService.getFullStaffList(conversation.businessId);

                const staffIds = staffList.map((staff) => staff._id);

                const notifications = staffList.map((staff) => {
                    const newNotification = JSON.parse(JSON.stringify(notification));
                    newNotification.to = staff._id;
                    newNotification.staffList = staffIds;

                    return newNotification;
                });

                const sendManyNotifications = async (notificationIndex: number = 0) => {
                    if(notifications.length <= notificationIndex) {
                        return;
                    }

                    await this.addNotificationByUserId(notifications[notificationIndex], staffList[notificationIndex]);

                    return sendManyNotifications(notificationIndex + 1);
                }

                await sendManyNotifications();
            }
        }
        
    }

    async removeStaffAwaitionNotificationBySenderId(senderId: string, businessId: string) {
        if(!senderId) {
            throw new HttpException(`Wrong senderId: ${senderId}!`, HttpStatus.BAD_REQUEST);
        }

        const senderData = await this.userService.getUserById(senderId, businessId, true);

        if(senderData) {
            const staffList = await this.userService.getFullStaffList(businessId);

            this.sendMenyNotificationsListUpdateTriggers(staffList);

            await this.notificationsModel.deleteMany({ from: senderId, actionType: "conversationStaffAwaition" });
        }
    }

    async removeStaffAwaitionNotificationsByConversationId(conversationId: string) {
        if(!conversationId) {
            throw new HttpException(`Wrong conversationId: ${conversationId}!`, HttpStatus.BAD_REQUEST);
        }

        const conversation = await this.conversationService.findConversationByIdIgnoreBelonging(conversationId);

        if(conversation) {
            const staffList = await this.userService.getFullStaffList(conversation.businessId);

            this.sendMenyNotificationsListUpdateTriggers(staffList);

            await this.notificationsModel.deleteMany({ conversationId, actionType: "conversationStaffAwaition" });
        }
    }

    async sendMenyNotificationsListUpdateTriggers(users: IUser[], userIndex: number = 0) {
        if(!Array.isArray(users) || users.length <= userIndex) {
            return;
        }

        await this.sendNotificationsListUpdatingTrigger(users[userIndex]._id);

        return this.sendMenyNotificationsListUpdateTriggers(users, userIndex + 1);
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

    async sendNotificationBySocket(notification: INotification) {
        if(!notification._id) {
            throw new HttpException(`Wrong \"notification\" data!`, HttpStatus.BAD_REQUEST);
        }

        const userConnectionInstances = this.socketService.getAllUserConnectionInstances(notification.to);

        const sendNotification = async (instanceIndex: number = 0) => {
            if(userConnectionInstances.length <= instanceIndex) {
                return;
            }

            await this.socketService.emitEvent(userConnectionInstances[instanceIndex].connection, "user/notification", notification);
            console.log(`Notification | ${notification.title} | sended to | ${notification.to} |`);
        }

        await sendNotification();

        return notification;
    }

    async readNotificationsByUserId(user: IUser) {
        if(!user._id) {
            throw new HttpException("Missing user's cookie!", HttpStatus.BAD_REQUEST);
        }

        await this.notificationsModel.updateMany({ to: user._id }, { isReaded: true }).exec();

        await this.sendNotificationsListUpdatingTrigger(user._id);

        return 0;
    }
}
