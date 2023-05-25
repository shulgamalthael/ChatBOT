export interface IOutputMessage { 
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

export interface IInputMessageProps { 
	text: string;
	link?: string;
	senderId: string;
	isForce?: boolean;
	actionType?: string;
	recipients: string[];
	conversationId: string;
	isCommandMenuOption?: boolean;
};