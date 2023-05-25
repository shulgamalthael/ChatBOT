/* @nest.js */
import { Logger } from '@nestjs/common';
import { WebSocketGateway, OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect, ConnectedSocket, SubscribeMessage, MessageBody } from '@nestjs/websockets';

/* @socket.io */
import { Socket as IConnection } from 'socket.io';

/* @services */
import { SocketService } from './socket.service';

/* @interfaces */
import { IInputMessageProps } from './interfaces/message.interface';

@WebSocketGateway({ transport: ['websocket'] })
export class SocketGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
	constructor(private readonly socketService: SocketService) {}

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

		return this.socketService.sendGreeting(user, message.conversationId);
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