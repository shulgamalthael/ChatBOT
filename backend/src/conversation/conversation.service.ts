/* @express */
import { Response } from "express";

/* @nest.js */
import { InjectModel } from "@nestjs/mongoose";
import { Injectable, HttpException, HttpStatus, Inject, forwardRef } from "@nestjs/common";

/* @mongoose */
import { Model } from "mongoose";

/* @entities */
import { User } from "../user/entities/user";
import { Conversation } from "./entities/conversation";
import { Message, Messages } from "./entities/messages";

/* @services */
import { BotService } from "../bot/bot.service";
import { SocketService } from "../socket/socket.service";

/* @interfaces */
import { IUser } from "../user/interfaces/user.interface";
import { IOutputMessage } from "src/socket/interfaces/message.interface";
import { IConnectedUser } from "../socket/interfaces/connection.interface";
import { FilledConversation, IConversation } from "./interfaces/conversation.interface";

/* @dto */
import { UserService } from "src/user/user.service";
import { ConversationDto } from "./dto/conversationDto/ConversationDto";
import { NotificationsService } from "src/notifications/notifications.service";
import { IGeneralSettings } from "src/bot/interfaces/generalSettings.interface";
import { FindConversationsPageByUserIdDTO } from "./dto/conversationDto/FindConversationPageByUserIdDTO";
import { ConversationMessagesPagination } from "./dto/conversationDto/ConversationMessagesPagination";
import { ILiveAgentSettings } from "src/bot/interfaces/liveAgentSettings.interface";

const generateConversation = (conversation: IConversation, user: IUser): IConversation => {
	return {
		_id:  conversation._id,
		creator:  conversation.creator,
		messages: conversation.messages,
		createdAt:  conversation.createdAt,
		recipients:  conversation.recipients,
		businessId:  conversation.businessId,
		franchiseId:  conversation.franchiseId,
		isConversationWaitingStaff: conversation.isConversationWaitingStaff,
		isConversationWithAssistant: conversation.isConversationWithAssistant,
		isConversationSupportedByStaff: conversation.isConversationSupportedByStaff,
		unreadedMessagesCount: conversation.unreadedMessagesCount || conversation.messages.filter((_message) => _message.sender._id !== user._id && !_message.isReaded).length,
	}
};

@Injectable()
export class ConversationService {
	constructor(
		@Inject(forwardRef(() => BotService))
		private readonly botService: BotService,
		@Inject(forwardRef(() => UserService))
		private readonly userService: UserService,
		@Inject(forwardRef(() => SocketService))
		private readonly socketService: SocketService,
		@Inject(forwardRef(() => NotificationsService))
		private readonly notificationsService: NotificationsService,
		@InjectModel(User.name) private readonly userModel: Model<User>,
		@InjectModel(Message.name) private readonly messageModel: Model<Message>,
		@InjectModel(Messages.name) private readonly messagesModel: Model<Messages>,
		@InjectModel(Conversation.name) private readonly conversationModel: Model<Conversation>,
	) {}

	async findConversationById(id: string, user: IUser) {
		if(!user._id) {
			throw new HttpException('missing users\'s cookie', HttpStatus.UNAUTHORIZED);
		}

		let conversation;

		try {
			conversation = await this.conversationModel.findById(id).exec();
		} catch {}

		if(!conversation) {
			throw new HttpException(`Conversation ${id} does not found!`, HttpStatus.NOT_FOUND);
		}

		if(!conversation.recipients.includes(user._id)) {
			throw new HttpException(`User ${user._id} does not belonging to conversation ${id}!`, HttpStatus.UNAUTHORIZED);
		}

		return conversation;
	}

	async getConversationById(id: string, user: IUser, queryParams: ConversationMessagesPagination, generalSettings) {
		const conversation = await this.findConversationById(id, user);

		let offset = parseInt(queryParams?.offset, 10) || 0;
		offset = offset - 1 || 0;
		let limit = parseInt(queryParams?.limit, 10) || 25;

		let conversationData: IConversation = generateConversation(conversation, user);

		conversationData.messages.reverse();
		conversationData.messages = conversation.messages.slice(offset * limit, (offset * limit) + limit);
		conversationData.messages.reverse();

		const filledConversation = await this.fillConversation(conversationData, user);

		return filledConversation;
	}

	async saveConversationMessage(conversationId: string, user: IUser, message: IOutputMessage) {
		const conversation = await this.conversationModel.findOne({ _id: conversationId }).exec();

		if(!conversation) {
			return { isMessageSaved: false, messages: [] };
		}

		conversation.messages.push(message);

		const newConversation = await this.conversationModel.findOneAndUpdate({ _id: conversationId }, conversation, { isNew: true }).exec();

		return { isMessageSaved: true, messages: newConversation.messages };
	}
	
	async fillConversation(conversation: IConversation, user: IUser) {
		const generateRecipientsDataMap = async (_index: number = 0, result = {}) => {
			if(_index >= conversation.recipients.length) {
				return result;
			}

			let recipientData = await this.userService.getUserById(conversation.recipients[_index], user, true);

			if(recipientData) {
				result[recipientData._id] = recipientData;
			}

			return await generateRecipientsDataMap(_index + 1, result);
		}
		
		const recipientsDataMap = await generateRecipientsDataMap();

		const getConversationTitle = (): string => {
			let recipientsDataList: IConnectedUser[] = Object.values(recipientsDataMap);
			recipientsDataList = recipientsDataList.filter((recipientData) => recipientData._id !== user._id);

			let title = '';
			if(!!recipientsDataList.length) {
				title += recipientsDataList.reduce((acc, recipientData) => {
					acc = acc ? `${acc}, ${recipientData.username}` : recipientData.username;

					return acc;
				}, '');
			}

			if(recipientsDataList.length < conversation.recipients.length) {
				const _title = conversation.recipients.reduce((acc, recipient) => {
					if(recipient !== user._id && !recipientsDataMap[recipient]) {
						const username = `guest#${recipient.slice(0, 4)}`;
						acc = acc ? `${acc}, ${username}` : username;
					}

					return acc;
				}, '');

				title = title
					? 	_title 	?	`${title}, ${_title}` :	title
					: 	_title
				;
			}

			return title;
		}

		const result: FilledConversation = generateConversation(conversation, user);

		result.title = getConversationTitle();
		result.recipientsDataById = recipientsDataMap;

		return result;
	}

	async getConversationsPageByUserId(queryParams: FindConversationsPageByUserIdDTO, user: IUser) {
		if(!user._id) {
			throw new HttpException('missing users\'s cookie', HttpStatus.UNAUTHORIZED);
		}

		if(user.role === "guest" || user.role === "user") {
			const conversations = [];
			const conversation = await this.conversationModel.findOne({
				creator: user._id,
				recipients: [user.businessId]
			});

			
			if(conversation) {
				conversation.messages = conversation.messages.slice(0, 25);
				conversations.push(conversation);
			}

			return conversations;
		}

		let offset = parseInt(queryParams?.offset, 10) || 0;
		offset = offset - 1 || 0;
		let limit = parseInt(queryParams?.limit, 10) || 10;

		let conversations = await this.conversationModel.find(
			{ recipients: { $all: [user._id] } }, 
			{},
			{ limit, skip: offset * limit }
		).exec();

		const conversationsArrayMap: IConversation[] = conversations.map((conversation) => {
			conversation._id = JSON.parse(JSON.stringify(conversation._id));
			const newConversation = generateConversation(conversation, user);

			if(Array.isArray(newConversation.messages)) {
				newConversation.messages = [...newConversation.messages.reverse()]
					.slice(0, 25)
				;
			}
			newConversation.messages = [...newConversation.messages.reverse()];

			return newConversation;
		});
	
		const fillCovnersations = async (_index: number = 0, result: FilledConversation[] = []) => {
			if(_index >= conversationsArrayMap.length) {
				return result;
			}

			result.push(await this.fillConversation(conversationsArrayMap[_index], user));

			return await fillCovnersations(_index + 1, result);
		}

		return await fillCovnersations();
	}

	async createConversation(conversationDto: ConversationDto, user: IUser) {
		if(!user._id) {
			throw new HttpException('Missing user\'s cookie', HttpStatus.BAD_REQUEST);
		}

		const offset = 0;
		const limit = 25;

		/* make possible extract sliced messages from database */
		let conversation;

		if(conversationDto.recipients.includes(user.businessId)) {
			conversation = await this.conversationModel.findOne({
				creator: user._id,
				recipients: { $all: [user._id, user.businessId] },
			}).exec();
		}

		if(!conversationDto.recipients.includes(user.businessId)) {
			conversation = await this.conversationModel.findOne({
				recipients: { $all: [user._id, ...conversationDto.recipients], $size: conversationDto.recipients.length + 1 },
			}).exec();
		}

		let conversationData: IConversation;

		if(!conversationDto.isNew && conversation) {
			conversationData = generateConversation(conversation, user);
			conversationData.messages = conversation.messages.reverse();
			conversationData.messages = conversation.messages.slice(offset * limit, (offset * limit) + limit);
			
			const newConversation = await this.fillConversation(conversationData, user)
			return newConversation;
		}

		const newConversation = {
			messages: [],
			creator: user._id,
			isConversationWaitingStaff: false,
			isConversationSupportedByStaff: false,
			createdAt: new Date().toISOString(),
			businessId: conversationDto.businessId,
			franchiseId: conversationDto.franchiseId,
			recipients: [user._id, ...conversationDto.recipients],
			isConversationWithAssistant: conversationDto.recipients.includes(user.businessId),
		}

		conversation = await this.conversationModel.create(newConversation);

		conversation = await conversation.save();

		conversationData = await this.fillConversation(generateConversation(conversation, user), user)
	
		return conversationData;
	}

	async makeConversationStaffAwationById(conversationId) {
		if(!conversationId) {
			throw new HttpException("conversationId is invalid!", HttpStatus.BAD_REQUEST);
		}

		const conversation = this.conversationModel.findOneAndUpdate({ _id: conversationId }, { isConversationWaitingStaff: true });

		if(!conversation) {
			throw new HttpException(`Conversation #${conversationId} does not exist!`, HttpStatus.BAD_REQUEST);
		}

		return conversation;
	}

	async makeConversationStaffUnawationById(conversationId) {
		if(!conversationId) {
			throw new HttpException("conversationId is invalid!", HttpStatus.BAD_REQUEST);
		}

		const conversation = this.conversationModel.findOneAndUpdate({ _id: conversationId }, { isConversationWaitingStaff: false });

		if(!conversation) {
			throw new HttpException(`Conversation #${conversationId} does not exist!`, HttpStatus.BAD_REQUEST);
		}

		return conversation;
	}

	async readConversationMessages(conversationId: string, user: IUser) {
		if(!user._id) {
			throw new HttpException("Missing user's cookie!", HttpStatus.BAD_REQUEST);
		}

		if(!conversationId) {
			throw new HttpException("Missing conversationId parameter!", HttpStatus.BAD_REQUEST);
		}

		const conversation = await this.conversationModel.findOne({ _id: conversationId }).exec();

		if(!conversation) {
			throw new HttpException(`Conversation #${conversationId} does not exist!`, HttpStatus.BAD_REQUEST);
		}

		conversation.messages = conversation.messages.map((_message) => {
			if(_message.sender._id !== user._id) {
				_message.isReaded = true;
			}
			return _message;
		});

		const updatedConversation = await this.conversationModel.findOneAndUpdate({ _id: conversation._id }, conversation, { new: true }).exec();
		
		return updatedConversation.messages.filter((_message) => _message.sender._id !== user._id && !_message.isReaded).length;
	}

	async getNewConversationSession(conversationId: string, user: IUser, generalSettings: IGeneralSettings) {
		if(!user._id) {
			throw new HttpException("Missing user's cookie!", HttpStatus.BAD_REQUEST);
		}

		if(!conversationId) {
			throw new HttpException("Missing conversationId parameter!", HttpStatus.BAD_REQUEST);
		}

		if(!generalSettings) {
			throw new HttpException("Missing General Settings!", HttpStatus.BAD_REQUEST);
		}

		const conversation = await this.findConversationById(conversationId, user);

		conversation.isConversationWaitingStaff = false;
		conversation.isConversationSupportedByStaff = false;

		await conversation.save();

		conversation.messages = [];

		const staffList = await this.userService.getFullStaffList();

		let filledConversation = await this.fillConversation(conversation, user);

		filledConversation.messages = [];
		filledConversation.isConversationWaitingStaff = false;
		filledConversation.isConversationSupportedByStaff = false;

		await this.notificationsService.removeStaffAwaitionNotificationsByConversationId(conversation._id);
		await this.sendUpdateConversationTriggerToRecipients(conversation);
		await this.notificationsService.sendMenyNotificationsListUpdateTriggers(staffList);

		return filledConversation;
	}

	async connectStaffToConversation(conversationId: string, staffId: string) {
		if(!conversationId) {
			throw new HttpException("Wrong \"conversationId\"!", HttpStatus.BAD_REQUEST);
		}

		if(!staffId) {
			throw new HttpException("Wrong \"staffId\"!", HttpStatus.BAD_REQUEST);
		}

		const conversation = await this.conversationModel.findOne({ _id: conversationId }).exec();

		if(!conversation) {
			throw new HttpException(`Conversation #${conversationId} does not exist!`, HttpStatus.BAD_REQUEST);
		}

		if(conversation.isConversationSupportedByStaff) {
			return false;
		}

		if(!conversation.recipients.includes(staffId)) {
			conversation.recipients.push(staffId);
		}

		conversation.isConversationWaitingStaff = false;
		conversation.isConversationSupportedByStaff = true;
		await conversation.save();

		const staffData = this.socketService.getUserById(staffId);

		await this.sendUserConnectionMessage(conversation, staffData);

		await this.sendUpdateConversationTriggerToRecipients(conversation);

		const generalSettings = await this.botService.getGeneralSettings(staffData);
		const liveAgentSettings = await this.botService.getLiveAgentSettings(staffData);

		if(liveAgentSettings.liveChatDuration.enabled) {
			let timer = liveAgentSettings.liveChatDuration.duration || 0;
			timer = timer * 1000 * 60;

			setTimeout(() => {
				this.endConversationSupportingByStaff(conversation._id, staffData, generalSettings);
			}, timer);
		}

		return true;
	}

	async sendUpdateConversationTriggerToRecipients(conversation: IConversation, recipientIndex: number = 0) {
		if(conversation.recipients.length <= recipientIndex) {
			return;
		}

		const recipientConnectionData = this.socketService.getConnectionByUserId(conversation.recipients[recipientIndex], true);

		if(recipientConnectionData) {
			await this.socketService.emitEvent(recipientConnectionData.connection, "conversation/update", { conversationId: conversation._id });
		}

		return this.sendUpdateConversationTriggerToRecipients(conversation, recipientIndex + 1);
	}

	async sendUserConnectionMessage(conversation: IConversation, user: IUser) {
		const recipientsConnectionInstances = conversation.recipients.reduce((acc, recipient) => {
			const recipientConnectionInstances = this.socketService.getAllUserConnectionInstances(recipient);

			if(!!recipientConnectionInstances.length) {
				acc.push(recipientConnectionInstances);
			}

			return acc;
		}, []);

		const sendConnectionMessage = async (recipientIndex: number = 0, instanceIndex: number = 0) => {
			if(recipientsConnectionInstances.length <= recipientIndex) {
				return;
			}

			if(recipientsConnectionInstances[recipientIndex].length <= instanceIndex) {
				return;
			}

			const recipientConnectionData = recipientsConnectionInstances[recipientIndex][instanceIndex];

			const message = {
				text: `${user.username} connected!`,
				isForce: true,
				link: undefined,
				actionType: undefined,
				isCommandMenuOption: false,
				conversationId: conversation._id,
				senderId: conversation.businessId,
				recipients: conversation.recipients,
				isConversationSupportedByStaff: true,
			};
	
			const sendedMessage = await this.socketService.sendConversationMessageFromClientToRecipient(recipientConnectionData.connection, message);

			return sendedMessage;
		}

		sendConnectionMessage();
	}

	async sendUserDisconnectionMessage(conversation: IConversation, user: IUser) {
		const recipientsConnectionInstances = conversation.recipients.reduce((acc, recipient) => {
			const recipientConnectionInstances = this.socketService.getAllUserConnectionInstances(recipient);

			if(!!recipientConnectionInstances.length) {
				acc.push(recipientConnectionInstances);
			}

			return acc;
		}, []);

		const sendConnectionMessage = async (recipientIndex: number = 0, instanceIndex: number = 0) => {
			if(recipientsConnectionInstances.length <= recipientIndex) {
				return;
			}

			if(recipientsConnectionInstances[recipientIndex].length <= instanceIndex) {
				return;
			}

			const recipientConnectionData = recipientsConnectionInstances[recipientIndex][instanceIndex];

			const message = {
				text: `${user.username} disconnected!`,
				isForce: true,
				link: undefined,
				actionType: undefined,
				isCommandMenuOption: false,
				conversationId: conversation._id,
				senderId: conversation.businessId,
				recipients: conversation.recipients,
				isConversationSupportedByStaff: true,
			};
	
			const sendedMessage = await this.socketService.sendConversationMessageFromClientToRecipient(recipientConnectionData.connection, message);

			return sendedMessage;
		}

		sendConnectionMessage();
	}

	async startConversationSupportingByStaff(conversationId: string, staffId: string, user: IUser, generalSettings: IGeneralSettings, liveAgentSettings: ILiveAgentSettings) {
		if(!liveAgentSettings) {
			throw new HttpException("Missing LiveAgent cookies", HttpStatus.BAD_REQUEST);
		}
		
		const conversation = await this.findConversationById(conversationId, user);

		conversation.isConversationWaitingStaff = false;
		conversation.isConversationSupportedByStaff = true;
		
		if(!conversation.recipients.includes(staffId)) {
			conversation.recipients.push(staffId);
		}

		await conversation.save();

		await this.sendUpdateConversationTriggerToRecipients(conversation);
		await this.sendUserConnectionMessage(conversation, user);

		if(liveAgentSettings.liveChatDuration.enabled) {
			let timer = liveAgentSettings.liveChatDuration.duration || 0;
			timer = timer * 1000 * 60;

			setTimeout(() => {
				this.endConversationSupportingByStaff(conversation._id, user, generalSettings);
			}, timer);
		}

		await this.notificationsService.removeStaffAwaitionNotificationsByConversationId(conversation._id);

		return this.fillConversation(conversation, user);
	}

	async endConversationSupportingByStaff(conversationId: string, user: IUser, generalSettings: IGeneralSettings) {
		const conversation = await this.findConversationById(conversationId, user);

		conversation.isConversationWaitingStaff = false;
		conversation.isConversationSupportedByStaff = false;
		
		await conversation.save();

		await this.sendUpdateConversationTriggerToRecipients(conversation);
		await this.sendUserDisconnectionMessage(conversation, user);

		return this.fillConversation(conversation, user);
	}
}
