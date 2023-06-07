/* @nest.js */
import { Inject, forwardRef, Logger } from '@nestjs/common';
import { WebSocketGateway, OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect, ConnectedSocket, SubscribeMessage, MessageBody } from '@nestjs/websockets';

/* @socket.io */
import { Socket as IConnection } from 'socket.io';

/* @services */
import { SocketService } from './socket.service';

/* @interfaces */
import { IInputMessageProps } from './interfaces/message.interface';
import { NotificationsService } from '../notifications/notifications.service';
import { INotification } from 'src/notifications/entities/notifications';
import { BotService } from 'src/bot/bot.service';

@WebSocketGateway({ transport: ['polling', 'websocket'] })
export class SocketGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
	constructor(
		@Inject(forwardRef(() => BotService))
		private readonly botService: BotService,
		@Inject(forwardRef(() => NotificationsService))
		private readonly notificationsService: NotificationsService,
		private readonly socketService: SocketService
	) {}

	private logger = new Logger('SocketGateway');

	@SubscribeMessage('message')
	handleMessageReceive(@MessageBody() message) {
		console.log(message);
	}

	@SubscribeMessage('bot/sendGreeting') 
	handleGreetingSending(connection: IConnection, message) {
		message = JSON.parse(message || "null");

		if(!message) {
			return;
		}

		const user = this.socketService.getCurrentUserCookie(connection);

		if(!user || !message.conversationId) {
			return;
		}

		return this.botService.sendGreeting(user, message.conversationId);
	}

	@SubscribeMessage('conversation/staff/accept')
	acceptStaffConversation(connection, message: string) {
		const notification: INotification = JSON.parse(message || "{}");

		return this.notificationsService.acceptNotification(notification);
	}

	@SubscribeMessage('conversation/staff/decline')
	declineStaffConversation(connection, message: string) {
		const notification: INotification = JSON.parse(message || "{}");

		return this.notificationsService.declineNotification(notification);
	}

	@SubscribeMessage('conversation/message')
	handleInputConversationMessage(connection: IConnection, message: IInputMessageProps) {
		return this.socketService.sendConversationMessageFromClientToRecipient(connection, message);
	}

	handleConnection(@ConnectedSocket() connection: IConnection) {
		this.socketService.addConnection(connection);
	}

	handleDisconnect(@ConnectedSocket() connection: IConnection) {
		this.socketService.removeConnection(connection);
	}

	afterInit() {
		this.logger.log('Socket Server Deployed');
	}
}