import { HttpException, HttpStatus, Injectable, Inject, forwardRef } from "@nestjs/common";
import { GeneralSettingsDto } from "./dto/generalSettingsDto";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { IUser } from "../user/interfaces/user.interface";
import { CommandsListDto } from "./dto/commandsListDto";

import { generateId } from "utils/scripts/spawner";
import { SocketService } from "../socket/socket.service";
import { IGenericObjectType } from "../../utils/interfaces/genericObjectType";
import { createWriteStream, lstatSync, mkdirSync } from "fs";
import { AllowPagesDto } from "./dto/allowPagesDto";
import { IPage } from "./interfaces/page.interface";
import { LiveAgentSettingsDto } from "./dto/LiveAgentSettingsDto";
import { ILiveAgentSettings } from "./interfaces/liveAgentSettings.interface";
import { IGeneralSettings } from "./interfaces/generalSettings.interface";

import CommandsListModel, { CommandsList } from "./entities/commandsList";
import GeneralSettingsModel, { GeneralSettings } from "./entities/generalSettings";
import LiveAgentSettingsModel, { LiveAgentSettings } from "./entities/liveAgentSettings";
import { ConversationService } from "../conversation/conversation.service";
import { NotificationsService } from "../notifications/notifications.service";
import { NotificationDto } from "../notifications/dto/notificationDto";
import { UserService } from "../user/user.service";

import { getSiteUrl } from "../../utils/scripts/getSiteUrl";
import { TwillioSettingsDto } from "./dto/twillioSettingsDto";
import TwillioSettingsModel, { TwillioSettings } from "./entities/twillio";
import { TwillioMailerDto } from "./dto/twillioMailerDto";
import { Twilio } from "twilio";

require("dotenv").config();

const siteUrl = getSiteUrl();

const isDir = (path: string): boolean => {
	try {
		return lstatSync(path).isDirectory();
	} catch {
		return false;
	}
}

interface IGeneralSettingsGenerationProps {
	businessId?: string;
	botName?: string;
	enabled?: boolean;
	allowPages?: IPage[];
	botAvatar?: string | null;
	showingChatTimer?: number;
	messageSendingTimer?: number;
}

const generateGeneralSettingsForClient = (generalSettings: IGeneralSettingsGenerationProps = {}) => ({
	botName: generalSettings.botName || 'Ahill BOT',
	enabled: generalSettings.enabled || false,
	botAvatar: generalSettings.botAvatar || `${siteUrl}/assets/avatars/assistant.jpg`,
	showingChatTimer: generalSettings.showingChatTimer || 0,
	messageSendingTimer: generalSettings.messageSendingTimer || 0,
});

const generateGeneralSettings = (generalSettings: IGeneralSettingsGenerationProps = {}) => ({
	businessId: generalSettings.businessId || "4444",
	botName: generalSettings.botName || 'Ahill BOT',
	enabled: generalSettings.enabled || false,
	botAvatar: generalSettings.botAvatar || `${siteUrl}/assets/avatars/assistant.jpg`,
	showingChatTimer: generalSettings.showingChatTimer || 0,
	messageSendingTimer: generalSettings.messageSendingTimer || 0,
	allowPages: Array.isArray(generalSettings.allowPages) && !!generalSettings.allowPages.length
		?	generalSettings.allowPages
		:	[{
			_id: generateId(),
			isChecked: true,
			title: "/"
		}]
});

interface IGenerateLiveAgentSettingsProps {
	triggerLink?: string;
	responseDuration?: number;
    liveChatDuration?: {
        enabled?: boolean;
        duration?: number;
    }
}

const generateLiveAgentSettings = (liveAgentSettings: IGenerateLiveAgentSettingsProps = { liveChatDuration: {} }): ILiveAgentSettings => ({
	triggerLink: liveAgentSettings.triggerLink || 'Talk to a real person',
	responseDuration: liveAgentSettings.responseDuration || 5,
	liveChatDuration: {
		enabled: liveAgentSettings.liveChatDuration.enabled || false,
		duration: liveAgentSettings.liveChatDuration.duration || 30
	}
});

interface IGenerateTwillioSettingsProps {
	number?: string;
    accountSid?: string;
    enabled?: boolean;
    accountAuthToken?: string;
}

const generateTwillioSettings = (twillioSettings?: IGenerateTwillioSettingsProps) => ({
	number: twillioSettings?.number || "",
	accountSid: twillioSettings?.accountSid || "",
	enabled: twillioSettings?.enabled || false,
	accountAuthToken: twillioSettings?.accountAuthToken || "",
});

@Injectable()
export class BotService {
	constructor(
		@Inject(forwardRef(() => UserService))
		private readonly usersService: UserService,
		@Inject(forwardRef(() => SocketService))
		private readonly socketService: SocketService,
		@Inject(forwardRef(() => ConversationService))
		private readonly conversationService: ConversationService,
		@Inject(forwardRef(() => NotificationsService))
		private readonly notificationService: NotificationsService,
		@InjectModel(CommandsListModel.name)
		private readonly commandsListModel: Model<CommandsList>,
		@InjectModel(GeneralSettingsModel.name)
		private readonly generalSettingsModel: Model<GeneralSettings>,
		@InjectModel(LiveAgentSettingsModel.name)
		private readonly liveAgentSettingsModel: Model<LiveAgentSettings>,
		@InjectModel(TwillioSettingsModel.name)
		private readonly twillioSettingsModel: Model<TwillioSettings>,
	) {}

	sendMessage = (message, userId, businessId: string) => {
		const globalSendingTimer = 100;
		const userConnection = this.socketService.getConnectionByUserId(userId, businessId);
		
		return new Promise((resolve) => {
			setTimeout(() => {
				resolve(this.socketService.sendConversationMessageFromClientToRecipient(userConnection.connection, message));
			}, globalSendingTimer);
		});
	}

	sendResponseMessage = async (responsesList, conversationId, user, responseIndex = 0) => {
		if(responseIndex >= responsesList.length) {
			return true;
		}

		const response = responsesList[responseIndex];

		await this.sendMessage({
			conversationId,
			text: response.title,
			recipients: [user._id],
			senderId: user.businessId,
		}, user._id, user.businessId);

		return this.sendResponseMessage(responsesList, conversationId, user, responseIndex + 1);
	}

	sendMenuOptionMessage = async (menuOptionsList, conversationId, user, menuOptionIndex = 0) => {
		if(menuOptionIndex >= menuOptionsList.length) {
			return true;
		}

		const menuOption = menuOptionsList[menuOptionIndex];

		await this.sendMessage({
			conversationId,
			text: menuOption.title,
			link: menuOption?.link,
			recipients: [user._id],
			isCommandMenuOption: true,
			senderId: user.businessId, 
			actionType: menuOption?.actionType,
		}, user._id, user.businessId);

		return this.sendMenuOptionMessage(menuOptionsList, conversationId, user, menuOptionIndex + 1);
	}

	async sendGreeting(user: IUser, conversationId: string) {
		const commandsList = await this.getCommandsList(user);
		const userConnection = this.socketService.getConnectionByUserId(user._id, user.businessId, true);

		if(!userConnection || !conversationId) {
			// throw new HttpException(`User ${user.username} does not exist!`, HttpStatus.BAD_REQUEST);
			return false;
		}

		const defaultGreetingCommand = {
			_id: generateId(),
			type: 'greeting',
			responsesList: [
				{
					_id: generateId(),
					title: "Welcome to WellnessLiving!",
				},
				{
					_id: generateId(),
					title: "How can I help You?"
				}
			],
			menuOptionsList: [],
		};

		const greetingCommand = commandsList.find((command) => {
			return /greeting/i.test(command.type);
		}) || defaultGreetingCommand;

		await this.sendResponseMessage(greetingCommand.responsesList, conversationId, user);
		await this.sendMenuOptionMessage(greetingCommand.menuOptionsList, conversationId, user);
	}

	async sendLiveAgentDescription(conversationId: string, user: IUser) {
		const liveAgentDescriptionList = [
			"Please wait, everybody agent is busy.",
			"We will connect You when it will possible.",
		];

		const userConnectionInstances = this.socketService.getAllUserConnectionInstances(user._id);

		const sendUpdateTriggerToUsers = async (instanceIndex = 0) => {
			if(instanceIndex >= userConnectionInstances.length) {
				return;
			}

			const connection = userConnectionInstances[instanceIndex];
			await this.socketService.emitEvent(connection.connection, "conversation/update", { conversationId });

			return sendUpdateTriggerToUsers(instanceIndex + 1);
		}

		const sendDescription = async (descriptionIndex: number = 0) => {
			if(descriptionIndex >= liveAgentDescriptionList.length) {
				await this.conversationService.makeConversationStaffAwationById(conversationId);
				await sendUpdateTriggerToUsers();
				return true;
			}

			const messageText = liveAgentDescriptionList[descriptionIndex];

			await this.sendMessage({
				isForce: true,
				conversationId,
				text: messageText,
				recipients: [user._id],
				senderId: user.businessId,
			}, user._id, user.businessId);

			return sendDescription(descriptionIndex + 1);
		}

		await sendDescription();

		const conversation = await this.conversationService.getConversationById(conversationId, user);

		const notificationTitle = conversation.recipients.reduce((acc, recipient) => {
			const recipientData = this.socketService.getUserById(recipient, true);

			if(recipientData && recipient === user._id) {
				if(acc) {
					acc += `,${recipientData.username}`;
				}

				if(!acc) {
					acc += recipientData.username;
				}
			}

			return acc;
		}, "") + " await You";

		let staffList = await this.usersService.getStaffList("0", user.businessId, false);
		staffList = staffList.filter((staff) => staff._id !== user._id);

		const staffIds = staffList.map((staff) => staff._id);

		const notifications: NotificationDto[] = staffList.map((staff) => ({
			to: staff._id,
			conversationId,
			from: user._id,
			isReaded: false,
			staffList: staffIds,
			isSocketAction: true,
			title: notificationTitle,
			accept: "conversation/staff/accept",
			decline: "conversation/staff/decline",
			actionType: "conversationStaffAwaition",
		}));

		const sendNotifications = async (staffIndex: number = 0) => {
			if(staffList.length <= staffIndex) {
				return true;
			}

			await this.notificationService.addNotificationByUserId(notifications[staffIndex], staffList[staffIndex]);
			
			return sendNotifications(staffIndex + 1);
		}

		return sendNotifications();
	}

	async sendMessageToBOT(message, user, conversationId, connection) {
		if(!user._id) {
			throw new HttpException('Missing User\'s cookie', HttpStatus.BAD_REQUEST);
		}

		if(!user.businessId) {
			throw new HttpException('Missing User\'s businessId', HttpStatus.BAD_REQUEST);
		}

		const generalSettings = await this.getGeneralSettings(user.businessId);

		const commandsList = await this.getCommandsList(user) || [];

		let timer = generalSettings.messageSendingTimer || 0;
		timer = timer * 1000;

		const sendMessageByResponseDurationTimer = async (callback: Function) => {
			const result = await new Promise((resolve) => {
				setTimeout(() => {
					resolve(callback());
				}, timer);
			});

			return result;
		};

		if(message.actionType === "liveAgentTrigger") {	
			if(/guest/i.test(user.username) || !user.email) {
				return await this.sendMessage({
					text: '',
					isForce: true,
					conversationId,
					actionType: 'userForm',
					recipients: [user._id],
					senderId: user.businessId,
				}, user._id, user.businessId);
			}

			if(!/guest/i.test(user.username) && user.email) {
				await this.sendLiveAgentDescription(conversationId, user);
			}
		}

		const defaultRejectingCommand = {
			_id: generateId(),
			type: 'rejecting',
			responsesList: [{
				_id: generateId(),
				title: "I didn't understand You.",
			}],
			menuOptionsList: [],
		};

		const rejectingCommand = commandsList.find((command) => {
			return command.type === "rejecting";
		}) || defaultRejectingCommand;

		const command = commandsList.find((command) => {
			return !!command.triggersList.find((trigger) => {
				return message.text && trigger.title && new RegExp(message.text, 'i').test(trigger.title);
			});
		});

		const sendRejectMessages = async () => {
			await this.sendResponseMessage(rejectingCommand.responsesList, conversationId, user);
			await this.sendMenuOptionMessage(rejectingCommand.menuOptionsList, conversationId, user);

			return true;
		}

		if(!command) {
			setTimeout(() => {
				sendMessageByResponseDurationTimer(sendRejectMessages);
			}, timer);

			return true;
		}

		const sendMessages = async () => {
			await this.sendResponseMessage(command.responsesList, conversationId, user);
			await this.sendMenuOptionMessage(command.menuOptionsList, conversationId, user);

			return true;
		}

		const isSended = await sendMessageByResponseDurationTimer(sendMessages);

		return isSended;
	}

	async saveBOTAvatar(botAvatar: IGenericObjectType, user: IUser) {
		if(!user._id) {
			throw new HttpException('Missing User\'s cookie', HttpStatus.BAD_REQUEST);
		}

		if(!user.businessId) {
			throw new HttpException('Missing User\'s businessId', HttpStatus.BAD_REQUEST);
		}

		if(!botAvatar) {
			throw new HttpException('botAvatar field is missing', HttpStatus.BAD_REQUEST);
		}

		let existsSettings = await this.generalSettingsModel.findOne({ businessId: user.businessId }).exec();

		const originalName = botAvatar.originalname;
		const fileNameExecutedArray = /\.(png|jpg|jpeg|webp)$/.test(originalName)
			?	/\.(png|jpg|jpeg|webp)$/.exec(originalName)
			: 	null
		;

		if(!Array.isArray(fileNameExecutedArray)) {
			throw new HttpException('File type does not supporting!', HttpStatus.BAD_REQUEST);
		}

		const fileType = fileNameExecutedArray[1];

		const appPath = process.env.ENV === "PRODUCTION"
			?	"./backend"
			:	"./"
		;

		const avatarPath = `uploads/avatars/${user.businessId}/${user.businessId}.${fileType}`;
		const path = `${appPath}/${avatarPath}`;
		const avatarUrl = `${siteUrl}/${avatarPath}`;

		if(!isDir(`${appPath}/uploads`)) {
			mkdirSync(`${appPath}/uploads`);
		}

		if(!isDir(`${appPath}/uploads/avatars`)) {
			mkdirSync(`${appPath}/uploads/avatars`);
		}

		if(!isDir(`${appPath}/uploads/avatars/${user.businessId}`)) {
			mkdirSync(`${appPath}/uploads/avatars/${user.businessId}`);
		}

		// if(isFile(path)) {
		// 	unlinkSync(path);
		// }

		const stream = await createWriteStream(path);
		await stream.write(botAvatar.buffer);
		await stream.end();

		// if(!isFile(path)) {
		// 	throw new HttpException('File was not created!', HttpStatus.BAD_REQUEST);
		// }

		if(!existsSettings) {
			return generateGeneralSettingsForClient({ botAvatar: avatarUrl });
		}

		existsSettings.botAvatar = avatarUrl;

		const generalSettings = await this.generalSettingsModel.findOneAndUpdate({ _id: existsSettings._id }, existsSettings, { new: true }).exec();
		return generateGeneralSettingsForClient(generalSettings);
	}

	async saveGeneralSettings(generalSettingsDto: GeneralSettingsDto, user: IUser) {
		if (!user._id) {
			throw new HttpException('Missing User\'s cookie', HttpStatus.BAD_REQUEST);
		}

		if (!user.businessId) {
			throw new HttpException('Missing User\'s businessId', HttpStatus.BAD_REQUEST);
		}

		const existsSettings = await this.generalSettingsModel.findOne({ businessId: user.businessId }).exec();
		const trueDto = {...generalSettingsDto, businessId: user.businessId};

		if (existsSettings) {
			const newGeneralSettings = await this.generalSettingsModel.findOneAndUpdate({ _id: existsSettings._id }, trueDto, { new: true }).exec();
			return generateGeneralSettingsForClient(newGeneralSettings);
		}

		const generalSettings = await this.generalSettingsModel.create(trueDto);
		return generateGeneralSettingsForClient(await generalSettings.save());
	}

	async saveCommandsList(commandsListDto: CommandsListDto, user: IUser) {
		if(!user._id) {
			throw new HttpException('Missing User\'s cookie', HttpStatus.BAD_REQUEST);
		}

		if(!user.businessId) {
			throw new HttpException('Missing User\'s businessId', HttpStatus.BAD_REQUEST);
		}

		const existsCommandsList = await this.commandsListModel.findOne({ businessId: user.businessId }).exec();

		const trueCommandsList = {...commandsListDto, businessId: user.businessId };

		if(existsCommandsList) {
			return this.commandsListModel.findOneAndUpdate({ _id: existsCommandsList._id }, trueCommandsList);
		}

		const commandsList = await this.commandsListModel.create(trueCommandsList);
		return commandsList.save();
	}

	async getAllowPages(user: IUser) {
		if(!user._id) {
			throw new HttpException('Missing User\'s cookie', HttpStatus.BAD_REQUEST);
		}

		if(!user.businessId) {
			throw new HttpException('Missing User\'s businessId', HttpStatus.BAD_REQUEST);
		}

		const generalSettings = await this.generalSettingsModel.findOne({ businessId: user.businessId });
		
		return generateGeneralSettings(generalSettings).allowPages;
	}

	async saveAllowPages(body: AllowPagesDto, user: IUser) {
		if(!user._id) {
			throw new HttpException('Missing User\'s cookie', HttpStatus.BAD_REQUEST);
		}

		if(!user.businessId) {
			throw new HttpException('Missing User\'s "businessId"', HttpStatus.BAD_REQUEST);
		}

		if(!Array.isArray(body.allowPages)) {
			throw new HttpException('Missing "allowPages" field in the request body', HttpStatus.BAD_REQUEST);
		}

		const generalSettings = await this.generalSettingsModel.findOne({ businessId: user.businessId }).exec();
		
		if(!generalSettings) {
			const generalSettings = await this.generalSettingsModel.create(body);
			return generateGeneralSettings(generalSettings).allowPages;
		}

		generalSettings.allowPages = body.allowPages;
		const newGeneralSettings = await generalSettings.save();
		return generateGeneralSettings(newGeneralSettings).allowPages;
	}

	async deleteAllowPage(pageId: string, user: IUser) {
		const generalSettings = await this.generalSettingsModel.findOne({ businessId: user.businessId }).exec();

		if(!generalSettings) {
			return generateGeneralSettings(generalSettings).allowPages;
		}

		const pageIndex = generalSettings.allowPages.findIndex((page) => page._id === pageId);

		if(pageIndex >= 0) {
			generalSettings.allowPages.splice(pageIndex, 1);
			const newGeneralSettings = await generalSettings.save();
			return generateGeneralSettings(newGeneralSettings).allowPages;
		}

		if(pageIndex < 0) {
			throw new HttpException(`page with "id" = ${pageId} does not exist!`, HttpStatus.BAD_REQUEST);
		}
	}

	async getCommandsList(user: IUser) {
		if(!user._id) {
			throw new HttpException('Missing User\'s cookie', HttpStatus.BAD_REQUEST);
		}

		if(!user.businessId) {
			throw new HttpException('Missing User\'s businessId', HttpStatus.BAD_REQUEST);
		}

		const commandsListDocument = await this.commandsListModel.findOne({ businessId: user.businessId }).exec();

		return commandsListDocument
			? commandsListDocument.commandsList
			: []
		;
	}

	async getGeneralSettings(businessId: string) {
		if(!businessId) {
			throw new HttpException('Missing businessId', HttpStatus.BAD_REQUEST);
		}

		let generalSettingsDocument = await this.generalSettingsModel.findOne({ businessId }).exec();

		let generalSettings: IGeneralSettings;
		if(generalSettingsDocument) {
			return generateGeneralSettingsForClient(generalSettingsDocument);
		}

		generalSettings = generateGeneralSettingsForClient();
		generalSettings.businessId = businessId;
		generalSettingsDocument = await this.generalSettingsModel.create(generalSettings);
		generalSettings = generateGeneralSettingsForClient(generalSettingsDocument);

		return generalSettings;
	}

	async getLiveAgentSettings(user: IUser) {
		if(!user._id) {
			throw new HttpException("User's cookie does not exist", HttpStatus.BAD_REQUEST);
		}

		if(!user.businessId) {
			throw new HttpException("User's \"businessId\" does not exist", HttpStatus.BAD_REQUEST);
		}

		let liveAgentSettings;

		try {
			liveAgentSettings = await this.liveAgentSettingsModel.findOne({ businessId: user.businessId }).exec();
		} catch {}

		if(liveAgentSettings) {
			return generateLiveAgentSettings(liveAgentSettings);
		}
	
		liveAgentSettings = generateLiveAgentSettings();
		liveAgentSettings.businessId = user.businessId;

		liveAgentSettings = await this.liveAgentSettingsModel.create(liveAgentSettings);

		return generateLiveAgentSettings(await liveAgentSettings.save());
	}

	async saveLiveAgentSettings(liveAgentSettingsDto: LiveAgentSettingsDto, user: IUser) {
		if(!user._id) {
			throw new HttpException("User's cookie does not exist", HttpStatus.BAD_REQUEST);
		}

		if(!user.businessId) {
			throw new HttpException("User's \"businessId\" does not exist", HttpStatus.BAD_REQUEST);
		}

		const liveAgentSettingsData = {
			...liveAgentSettingsDto,
			businessId: user.businessId,
		}

		let liveAgentSettings = await this.liveAgentSettingsModel.findOneAndUpdate({ businessId: user.businessId }, liveAgentSettingsData, { new: true });

		if(liveAgentSettings) {
			return generateLiveAgentSettings(liveAgentSettings);
		}

		liveAgentSettings = await this.liveAgentSettingsModel.create(liveAgentSettingsData);

		return generateLiveAgentSettings(await liveAgentSettings.save());
	}

	async saveTwillioSettings(twillioSettingsDto: TwillioSettingsDto, businessId: string) {
		if(!businessId) {
			throw new HttpException("businessId does not exist!", HttpStatus.BAD_REQUEST);
		}

		let twillioSettings = await this.twillioSettingsModel.findOne({ businessId }).exec();

		if(twillioSettings) {
			twillioSettings.number = twillioSettingsDto.number;
			twillioSettings.enabled = twillioSettingsDto.enabled;
			twillioSettings.accountSid = twillioSettingsDto.accountSid;
			twillioSettings.accountAuthToken = twillioSettingsDto.accountAuthToken;

			await twillioSettings.save();

			return generateTwillioSettings(twillioSettings);
		}

		twillioSettingsDto.businessId = businessId;

		twillioSettings = await this.twillioSettingsModel.create(twillioSettingsDto);
		
		return generateTwillioSettings(twillioSettings);
	}

	async getTwillioSettings(businessId: string) {
		if(!businessId) {
			throw new HttpException("businessId does not exist!", HttpStatus.BAD_REQUEST);
		}

		const twillioSettings = await this.twillioSettingsModel.findOne({ businessId }).exec();
		
		return generateTwillioSettings(twillioSettings);
	}
	
	async sendTwillioMessage(twillioMailerDto: TwillioMailerDto, businessId: string) {
		if (!twillioMailerDto.number) {
			throw new HttpException("recipient \"number\" is invalid!", HttpStatus.BAD_REQUEST);
		}

		if (!twillioMailerDto.message) {
			throw new HttpException("recipient \"message\" is invalid!", HttpStatus.BAD_REQUEST);
		}

		const twillioSettings = await this.getTwillioSettings(businessId);

		if (!twillioSettings.accountSid || !twillioSettings.accountAuthToken || !twillioSettings.number) {
			return false;
		}
		
		try {
			const client = new Twilio(twillioSettings.accountSid, twillioSettings.accountAuthToken);

			client.messages
			.create({
				body: twillioMailerDto.message,
				to: twillioMailerDto.number,
				from: twillioSettings.number,
			})
			.then((message) => console.log(message.sid))
			.catch((err) => console.log(err))
		} catch {
			throw new HttpException("Twillio message does not sended!", HttpStatus.BAD_REQUEST);
		};

		return true;
	}

	async sendNodemailerMessage() {
		try {
			const nodemailer = require('nodemailer');

			const transporter = nodemailer.createTransport({
				service: 'gmail',
				auth: {
					user: 'shulgamalthael@gmail.com',
					pass: 'Nikita5544'
				}
			});

			const mailOptions = {
				from: 'shulgamalthael@gmail.com',
				to: 'nikita.shulha007@gmail.com',
				subject: 'Subject',
				text: 'Hello Nikita! /n Im the Creator of the ChatBOT!'
			};

			transporter.sendMail(mailOptions, function(error, info) {
				if (error) {
					console.log(error);
				} else {
					console.log('Email sent: ' + info.response);
					// do something useful
				}
			});
		} catch { return false; }

		return true;
	}
}
