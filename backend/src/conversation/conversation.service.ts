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
import { ConversationDto } from "./dto/conversationDto/ConversationDto";
import { FindConversationsPageByUserIdDTO } from "./dto/conversationDto/FindConversationPageByUserIdDTO";
import { ConversationMessagesPagination } from "./dto/conversationDto/ConversationMessagesPagination";
import { IGeneralSettings } from "src/bot/interfaces/generalSettings.interface";

const generateConversation = (conversation: IConversation, user: IUser): IConversation => ({
	_id:  conversation._id,
	creator:  conversation.creator,
	messages: conversation.messages,
	createdAt:  conversation.createdAt,
	recipients:  conversation.recipients,
	businessId:  conversation.businessId,
	franchiseId:  conversation.franchiseId,
	isConversationWaitingStuff: conversation.isConversationWaitingStuff,
	unreadedMessagesCount: conversation.unreadedMessagesCount || conversation.messages.filter((_message) => _message.sender._id !== user._id && !_message.isReaded).length,
});

@Injectable()
export class ConversationService {
	constructor(
		@Inject(forwardRef(() => BotService))
		private readonly botService: BotService,
		@Inject(forwardRef(() => SocketService))
		private readonly socketService: SocketService,
		@InjectModel(User.name) private readonly userModel: Model<User>,
		@InjectModel(Message.name) private readonly messageModel: Model<Message>,
		@InjectModel(Messages.name) private readonly messagesModel: Model<Messages>,
		@InjectModel(Conversation.name) private readonly conversationModel: Model<Conversation>,
	) {}

	async findConversationById(id: string, user: IUser) {
		if(!user._id) {
			throw new HttpException('missing users\'s cookie', HttpStatus.UNAUTHORIZED);
		}

		const conversation = await this.conversationModel.findOne({ _id: id }).exec();

		if(!conversation) {
			throw new HttpException(`Conversation ${id} does not found!`, HttpStatus.NOT_FOUND);
		}

		// if(conversation) {
		// 	conversation.messages.reverse();
		// 	conversation.messages = conversation.messages.slice(offset * limit, (offset * limit) + limit);
		// }

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

		return this.fillConversation(conversationData, user, generalSettings);
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
	
	async fillConversation(conversation: IConversation, user: IUser, generalSettings) {
		const recipients = conversation.recipients.filter(recipient => recipient !== user._id);

		const generateRecipientsDataMap = async (_index: number = 0, result = {}) => {
			if(_index >= recipients.length) {
				return result;
			}

			let recipientData: IUser | IConnectedUser = this.socketService.getUserById(recipients[_index], true);
			
			try {
				if(!recipientData) {
					recipientData = await this.userModel.findOne({ _id: recipients[_index] }).exec();
				}
			} catch {}

			if(recipients.includes(user.businessId)) {
				generalSettings = generalSettings || this.botService.getGeneralSettings(user) || {};

				result[user.businessId] = {
					email: "",
					role: "staff",
					_id: user.businessId,
					businessId: user.businessId,
					createdAt: new Date().toISOString(),
					lastVisitAt: new Date().toISOString(),
					avatarUrl: generalSettings.botAvatar || "",
					username: generalSettings.botName || `guest#${user.businessId}`
				};
			}

			if(recipientData) {
				result[recipientData._id] = recipientData;
			}

			return await generateRecipientsDataMap(_index + 1, result);
		}
		
		const recipientsDataMap = await generateRecipientsDataMap();

		const recipientsDataById = {
			[user._id]: user,
			...recipientsDataMap,
		}

		const getConversationTitle = (): string => {
			const recipientsDataList: IConnectedUser[] = Object.values(recipientsDataMap)
			if(recipientsDataList.length) {
				return recipientsDataList.reduce((acc, recipient) => {
					acc = acc ? `${acc}, ${recipient.username}` : recipient.username;
					return acc;
				}, '');
			}

			if(recipients.length) {
				return recipients
					// .filter(recipient => recipient !== user.businessId)
					.reduce((acc, recipient) => {
						const recipientName = `Guest#${recipient.substring(0, 4)}`;
						acc = acc ? `${acc}, ${recipientName}` : recipientName;
						return acc;
				}, '');
			}

			return user.username;
		}

		const result: FilledConversation = generateConversation(conversation, user);

		result.title = getConversationTitle();
		result.recipientsDataById = recipientsDataById;

		return result;
	}

	async getConversationsPageByUserId(queryParams: FindConversationsPageByUserIdDTO, user: IConnectedUser, generalSettings) {
		const userId = user._id;

		if(!userId) {
			throw new HttpException('missing users\'s cookie', HttpStatus.UNAUTHORIZED);
		}

		let offset = parseInt(queryParams?.offset, 10) || 0;
		offset = offset - 1 || 0;
		let limit = parseInt(queryParams?.limit, 10) || 10;

		let conversations = await this.conversationModel.find(
			{ recipients: { $all: [userId] } }, 
			{},
			{ limit, skip: offset * limit }
		).exec();

		const conversationsArrayMap: IConversation[] = conversations.map((conversation) => {
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

			result.push(await this.fillConversation(conversationsArrayMap[_index], user, generalSettings));

			return await fillCovnersations(_index + 1, result);
		}

		return await fillCovnersations();
	}

	async createConversation(conversationDto: ConversationDto, user: IUser, generalSettings, response: Response) {
		if(!user._id) {
			throw new HttpException('Missing user\'s cookie', HttpStatus.BAD_REQUEST);
		}

		if(!generalSettings) {
			generalSettings = await this.botService.getGeneralSettings(user);
			
			response.cookie('wlc_gs', JSON.stringify(generalSettings));
		}

		const offset = 0;
		const limit = 25;

		/* make possible extract sliced messages from database */
		let conversation = await this.conversationModel.findOne({ 
			recipients: { $all: [user._id, ...conversationDto.recipients], $size: conversationDto.recipients.length + 1 },
		}).exec();

		let conversationData: IConversation;

		if(!conversationDto.isNew && conversation) {
			conversationData = generateConversation(conversation, user);
			conversationData.messages = conversation.messages.reverse();
			conversationData.messages = conversation.messages.slice(offset * limit, (offset * limit) + limit);
			
			return response.json(await this.fillConversation(conversationData, user, generalSettings));
		}

		const newConversation = {
			messages: [],
			creator: user._id,
			createdAt: new Date().toISOString(),
			businessId: conversationDto.businessId,
			franchiseId: conversationDto.franchiseId,
			recipients: [user._id, ...conversationDto.recipients],
		}

		conversation = await this.conversationModel.create(newConversation);

		conversation = await conversation.save();

		conversationData = await this.fillConversation(generateConversation(conversation, user), user, generalSettings)

		return response.json(conversationData);
	}

	async makeConversationStuffAwationById(conversationId) {
		if(!conversationId) {
			throw new HttpException("conversationId is invalid!", HttpStatus.BAD_REQUEST);
		}

		const conversation = this.conversationModel.findOneAndUpdate({ _id: conversationId }, { isConversationWaitingStuff: true });

		if(!conversation) {
			throw new HttpException(`Conversation #${conversationId} does not exist!`, HttpStatus.BAD_REQUEST);
		}

		return conversation;
	}

	async makeConversationStuffUnawationById(conversationId) {
		if(!conversationId) {
			throw new HttpException("conversationId is invalid!", HttpStatus.BAD_REQUEST);
		}

		const conversation = this.conversationModel.findOneAndUpdate({ _id: conversationId }, { isConversationWaitingStuff: false });

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

		const conversation = await this.conversationModel.findOneAndUpdate({ _id: conversationId }, { isConversationWaitingStuff: false }, { returnOriginal: false }).exec();

		if(!conversation) {
			throw new HttpException(`Conversation #${conversationId} does not exist!`, HttpStatus.BAD_REQUEST);
		}

		const filledConversation = await this.fillConversation(conversation, user, generalSettings);

		return {
			_id: filledConversation._id,
			messages: [],
			title: filledConversation.title,
			creator: filledConversation.creator,
			createdAt: filledConversation.createdAt,
			recipients: filledConversation.recipients,
			businessId: filledConversation.businessId,
			franchiseId: filledConversation.franchiseId,
			recipientsDataById: filledConversation.recipientsDataById,
			unreadedMessagesCount: filledConversation.unreadedMessagesCount,
			isConversationWaitingStuff: filledConversation.isConversationWaitingStuff,
		}
	}
}
