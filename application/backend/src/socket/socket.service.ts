/* @nest.js */
import { forwardRef } from '@nestjs/common/utils';
import { Inject } from '@nestjs/common/decorators';
import { ConnectedSocket as IConnection } from '@nestjs/websockets';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';

/* @cookie */
import * as cookie from 'cookie';

/* @socket.io */
import { Socket } from 'socket.io';

/* @schemas */
import { IUser } from '../user/interfaces/user.interface';

/* @scripts */
import { generateId } from '../../utils/scripts/spawner';

/* @service */
import { BotService } from '../bot/bot.service';

/* @interfaces */
import { ConversationService } from '../conversation/conversation.service';
import { IInputMessageProps, IOutputMessage } from './interfaces/message.interface';
import { Connections, IConnectedUser, IUserConnection } from './interfaces/connection.interface';
import { IGenericObjectType } from '../../utils/interfaces/genericObjectType';
import { UserService } from '../user/user.service';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class SocketService {
	private connections: Connections = {};

	constructor(
		@Inject(forwardRef(() => BotService))
		private readonly botService: BotService,
		@Inject(forwardRef(() => UserService))
		private readonly userService: UserService,
		@Inject(forwardRef(() => ConversationService))
		private readonly conversationService: ConversationService,
		@Inject(forwardRef(() => NotificationsService))
		private readonly notificationService: NotificationsService,
	) {}

	private getUsersCount() {
		return Object.values(this.connections).length;
	}

	getCurrentUserCookie = (connection: Socket): IConnectedUser => {
		let cookies = cookie.parse(connection?.handshake?.headers?.cookie || '{}');
		
		const userCookieFile: IUser | null = cookies['wlc_cud']
			?	JSON.parse(cookies['wlc_cud'])
			: 	null
		;
		
		const guestCookieFile: IUser | null = cookies['wlc_gud']
			?	JSON.parse(cookies['wlc_gud'])
			: 	null
		;

		const businessId = cookies['wlc_bid'];
		
		const resultUserCookieFile = userCookieFile
			? 	{...userCookieFile, connectionId: connection.id, businessId}
			: 	{...guestCookieFile, connectionId: connection.id, businessId}
		;
		
		return resultUserCookieFile;
	}

	async sendMessage(messageConfiguration) {
		const { message, conversationId, user, recipients } = messageConfiguration;

		let recipientsUserData: IConnectedUser[] = [];

		const senderData = await this.userService.getUserById(message.senderId || user._id, user.businessId); 

		recipients.forEach((recipient) => {
			const connectionsMapArray = Object.values(this.connections);
			let authorizedRecipient = connectionsMapArray.find((connection) => connection.userData._id === recipient);

			if (authorizedRecipient) {
				recipientsUserData.push(authorizedRecipient.userData);
			}
		});

		const newMessage: IOutputMessage = {
			_id: generateId(),
			conversationId,
			isReaded: false,
			link: message.link,
			text: message.text,
			isForce: message.isForce,
			actionType: message.actionType,
			sendedAt: new Date().toISOString(),
			isCommandMenuOption: message.isCommandMenuOption,
			sender: { _id: senderData._id, username: senderData.username },
			recipients: recipientsUserData
				.map((recipient) => ({ _id: recipient._id, username: recipient.username })),
		}

		const savingResult = await this.conversationService.saveConversationMessage(conversationId, user, newMessage);

		let conversationMessages = savingResult.messages || [];
		let isMessageSaved = savingResult.isMessageSaved || false;

		if(isMessageSaved) {
			recipientsUserData.forEach((recipient) => {
				let recipientConnectionData = this.connections[recipient.connectionId];

				if(recipient._id === user._id) {
					recipientConnectionData = this.connections[user.connectionId];
				}

				const unreadedMessagesCount = conversationMessages.reduce((acc, message) => {
					if(message.sender._id !== recipientConnectionData.userData._id && !message.isReaded) {
						acc += 1;
					}

					return acc;
				}, 0);

				const recipientInstances = this.getAllUserConnectionInstances(recipientConnectionData.userData._id);

				recipientInstances.forEach((recipientData) => {
					newMessage.unreadedMessagesCount = unreadedMessagesCount;

					recipientData.connection.emit('conversation/message/client', newMessage);
				});

				console.log(`Sended | ${message.text} | to | ${recipient.username} | ${recipient.connectionId} |`);
			});
		}

		return newMessage;
	}

	async sendConversationMessageFromClientToRecipient(connection: Socket, inputMessage: IInputMessageProps) {
		let cookies = cookie.parse(connection.handshake.headers.cookie || '{}');
		const businessId = cookies['wlc_bid'];
		const currentUserData = this.getUserByConnectionId(connection.id, businessId);
		const generalSettings = await this.botService.getGeneralSettings(currentUserData.businessId);
		currentUserData.businessId = currentUserData.businessId || businessId;

		const filteredRecipientsList = inputMessage.recipients.reduce((acc, recipient) => {
			if(inputMessage.recipients.includes(currentUserData.businessId)) {
				if(!inputMessage.isConversationSupportedByStaff && recipient === currentUserData._id) {
					acc.push(recipient);
				}
	
				if(inputMessage.isConversationSupportedByStaff && recipient !== currentUserData.businessId) {
					acc.push(recipient);
				}
			}

			if(!inputMessage.recipients.includes(currentUserData.businessId)) {
				acc.push(recipient);
			}

			return acc;
		}, []);

		const message = {
			text: inputMessage.text,
			link: inputMessage.link,
			isForce: inputMessage.isForce,
			senderId: inputMessage.senderId,
			actionType: inputMessage.actionType,
			recipients: inputMessage.recipients,
			isCommandMenuOption: inputMessage.isCommandMenuOption,
			isConversationSupportedByStaff: inputMessage.isConversationSupportedByStaff,
		};

		const messageConfiguration = {
			message, 
			generalSettings, 
			putToDatabase: true,
			user: currentUserData,
			recipients: filteredRecipientsList,
			conversationId: inputMessage.conversationId,
		};

		if (inputMessage.recipients.includes(businessId) && !message.isConversationSupportedByStaff) {
			await this.sendMessage(messageConfiguration);
			return this.botService.sendMessageToBOT(message, currentUserData, inputMessage.conversationId, connection);
		}

		return this.sendMessage(messageConfiguration);
	}

	emitEvent(connection: Socket, eventType: string, message?: IGenericObjectType) {
		connection.emit(eventType, JSON.stringify(message));
	}

	notificateAllUsersAboutNewConnection() {
		for (let connection in this.connections) {
			this.connections[connection].connection.emit('user-connection');
		}
	}

	notificateAllUsersAboutNewDisconnection(connectionId) {
		for(let connection in this.connections) {
			if(connection === connectionId) {
				return;
			}

			this.connections[connection].connection.emit('user-disconnection');
		}
	}

	addConnection(@IConnection() connection: Socket) {
		const userCookieFile: IConnectedUser = this.getCurrentUserCookie(connection);

		this.connections[connection.id] = {
			connection,
			id: connection.id,
			userData: userCookieFile,
		}
		
		this.notificateAllUsersAboutNewConnection();

		console.log('connection', `| ${userCookieFile.username} | ${connection.id} | connected, online: ${this.getUsersCount()}`);

		return true;
	}

	removeConnection(@IConnection() connection: Socket) {
		const userCookieFile: IConnectedUser = this.getCurrentUserCookie(connection);

		delete this.connections[connection.id];
		this.notificateAllUsersAboutNewDisconnection(connection.id);
		this.notificationService.removeStaffAwaitionNotificationBySenderId(userCookieFile._id, userCookieFile.businessId);
		console.log('connection', `| ${userCookieFile.username} | ${connection.id} | disconnected, online: ${this.getUsersCount()}`);

		return true;
	}

	getUsersList(businessId: string): IConnectedUser[] {
		const connections = Object.values(this.connections);
		return connections
			.filter((connection) => connection.userData.businessId === businessId)
			.map((connection) => connection.userData);
	}

	getAllUserConnectionInstances(userId: string) {
		const connections = Object.values(this.connections);
		const users = connections.filter((connection) => connection.userData._id === userId);

		return users;
	}

	getUserByConnectionId(connectionId: string, businessId: string, skipException?: boolean) {
		const connections = Object.values(this.connections);
		const user = connections.find((connection) => {
			return(
				connection.connection.id === connectionId &&
				connection.userData.businessId === businessId
			);
		});

		if(!user && !skipException) {
			throw new HttpException(`user ${connectionId} not found`, HttpStatus.NOT_FOUND);
		}

		if(user) {
			return user.userData;
		}

		return null;
	}

	getUserById(userId: string, skipException?: boolean): IConnectedUser | null {
		const connections = Object.values(this.connections);

		let user = connections.find((connection) => connection.userData._id === userId);

		if(!user && !skipException) {
			throw new HttpException(`user ${userId} not found`, HttpStatus.NOT_FOUND);
		}

		if(user) {
			return user.userData;
		}

		return null;
	}

	getConnectionByUserId(userId: string, businessId: string, skipException?: boolean): IUserConnection | null {
		const connections = Object.values(this.connections);
		const user = connections.find((connection) => {
			return(
				connection.userData._id === userId &&
				connection.userData.businessId === businessId
			);
		});

		if(!user && !skipException) {
			throw new HttpException(`user ${userId} not found`, HttpStatus.NOT_FOUND);
		}

		if(user) {
			return user;
		}

		return null;
	}

	getStaffList(businessId: string) {
		const connections = Object.values(this.connections);
		const staffList = connections.filter((connection) => {
			return (
				connection.userData.role === "staff" && 
				connection.userData.businessId === businessId
			)
		});

		return staffList;
	}

	changeUserRole(userId: string, role: string) {
		const connections = Object.entries(this.connections);
		let user;

		this.connections = connections.reduce((acc, entries) => {
			acc[entries[0]] = entries[1];

			if(entries[1].userData._id === userId) {
				acc[entries[0]].userData.role = role;
				user = acc[entries[0]].userData;
			}

			return acc;
		}, {});

		return user;
	}
}
