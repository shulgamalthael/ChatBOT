import { IUserData } from "../stores/socket/socket";

export interface IConversationData {
	businessId: string;
	franchiseId: string;
	recipients: string[];
}

interface IRecipientsDataMap { 
	[key: string]: IUserData 
}

export interface IConversation {
	_id: string;
	creator: string;
	createdAt: string;
	businessId: string;
	franchiseId: string;
	recipients: string[];
	conversationId: string;
	messages: IInputMessage[];
	unreadedMessagesCount: number;
	recipientsDataById: IRecipientsDataMap;
	isConversationWaitingStaff: boolean;
	isConversationSupportedByStaff: boolean;
}

export interface IInputMessage { 
	_id: string;
	link?: string;
	text: string;
	sendedAt: string;
	isReaded: boolean;
	isForce?: boolean;
	actionType?: string;
	conversationId: string;
	isCommandMenuOption?: boolean;
	unreadedMessagesCount?: number;
	sender: { _id: string; username: string };
	recipients: { _id: string; username: string }[];
}

export interface IOutputMessage {
	text: string;
	link?: string;
	senderId: string;
	isForce?: boolean;
	actionType?: string;
	recipients: string[];
	conversationId: string;
	isCommandMenuOption?: boolean;
	isConversationSupportedByStaff?: boolean;
}