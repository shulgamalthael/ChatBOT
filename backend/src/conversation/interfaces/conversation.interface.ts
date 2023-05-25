/* @interfaces */
import { IOutputMessage } from "../../socket/interfaces/message.interface";
import { IConnectedUser } from "../../socket/interfaces/connection.interface";

export interface IConversation {
	_id: string;
	creator: string;
	createdAt: string;
	businessId: string;
	franchiseId: string;
	recipients: string[];
	messages: IOutputMessage[];
	unreadedMessagesCount?: number;
	isConversationWaitingStuff?: boolean;
}

export interface FilledConversation extends IConversation {
	title?: string,
	recipientsDataById?: {
		[key: string]: IConnectedUser
	}
}