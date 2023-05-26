/* @immer */
import { produce } from "immer";

/* @zustand */
import { create } from "zustand";

/* @interfaces */
import { IUser } from "../../interfaces/user.interface";
import { IConversation, IInputMessage, IOutputMessage, IConversationData } from "../../interfaces/conversation.interface";

/* @api */
import { createConversationApi, getNewConversationSessionApi, queryConversationByIdAPI, queryConversationsListAPI, QueryConversationsListParams, readConversationMessagesApi } from "../../api/api";
import useSocketStore, { IUserData } from "../socket/socket";
import { useSettingsStore } from "../settings/settings";
import { Socket } from "socket.io-client";
import { useUserStore } from "../user/user";

export const conversationLocalStorageKeys = {
	isBotConversationStopped: "wl-cb-isBotConversationStopped"
}

export interface ICloudMessage extends IInputMessage {
	recipientData: IUserData;
}

interface IBotConversationSettings {
	isStopped: boolean;
}

interface IMessagesCloudState {
	list: ICloudMessage[];
	closeMessage: (messageIndex: number) => void;
	addMessage: (message: IInputMessage, isChatOpened: boolean) => void;
}

interface ConversationsState {
	botConversationSettings: IBotConversationSettings;
	messagesCloudState: IMessagesCloudState;
	isLastPaginationPage: boolean;
	conversations: IConversation[];
	isConversationFetching: boolean;
	isMessagesListFetching: boolean;
	messagesPaginationOffset: number;
	isMessagesPaginationBlocked: boolean;
	isConversationWaitingStuff: boolean;
	conversationsPaginationOffset: number;
	unlockPaginationInTheNextStep: boolean;
	selectedConversation: IConversation | null;
	unreadedMessagesCount: number;
	
	stopBOTConversation: () => void;
	unlockMessagesPagination: () => void;
	readConversationMessages: () => void;
	getMessagesPaginationPage: () => void;
	toggleMessagesFetchingFlag: () => void;
	increaseUnreadedMessagesCount: () => void;
	toggleConversationFetchingFlag: () => void;
	calculateUnreadedMessagesCount: () => void;
	startBOTConversation: () => Promise<boolean>;
	createConversationWithBOT: () => Promise<boolean>;
	lockBotConversation: (userData: IUserData) => void;
	sendMessageToServer: (message: IInputMessage) => void;
	selectConversation: (conversation: IConversation) => void;
	closeAllSimilarCloudMessages: (messageIndex: number) => void;
	addMessage: (message: IInputMessage, userData: IUser) => void;
	updateIsConversationWaitingStuffState: (prop: boolean) => void;
	queryConversationByIdAndSelectIt: (conversationId: string) => void;
	generateOutputMessage: (messageText: string) => IOutputMessage | null;
	createConversation: (conversationData: IConversationData) => Promise<boolean>;
	queryConversationsList: (params: QueryConversationsListParams, userData: IUser) => void;
	scrollIntoView: (element: HTMLElement, behavior: ScrollBehavior, block: ScrollLogicalPosition, isForce: boolean) => void;
}

export const useConversationsStore = create<ConversationsState>((set, get): ConversationsState => {
	const lockBotConversation = (userData: IUserData) => {
		const selectedConversation = get().selectedConversation;
		const isBotConversation = selectedConversation?.recipients?.includes(userData?.businessId);

		if(!isBotConversation) {
			set(produce((draft) => {
				draft.botConversationSettings.isStopped = false;
			}));
		}

		if(isBotConversation) {
			set(produce((draft) => {
				draft.botConversationSettings.isStopped = JSON.parse(localStorage.getItem(conversationLocalStorageKeys.isBotConversationStopped) || "false");
				console.log(JSON.parse(localStorage.getItem(conversationLocalStorageKeys.isBotConversationStopped) || "false"));
			}));
		}
	}

	const selectConversation = (conversation: IConversation, isForce: boolean = false) => {
		const selectedConversation = get().selectedConversation;

		if((!isForce && selectedConversation) && selectedConversation && conversation._id === selectedConversation._id) {
			return true;
		}

		if(isForce || !selectedConversation || conversation._id !== selectedConversation._id) {
			set({ selectedConversation: conversation, isLastPaginationPage: false, messagesPaginationOffset: 1 });
			return true;
		}

		return false;
	};

	const queryConversationsList = async (params: QueryConversationsListParams, userData: IUser) => {
		const { isFetched, data } = await queryConversationsListAPI(params);

		if(isFetched && data && Array.isArray(data)) {
			set({ conversations: data });
		}
	}

	const createConversationWithBOT = (): Promise<boolean> => {
		const conversationData: IConversationData = {
			franchiseId: "",
			businessId: "4444",
			recipients: ["4444"],
		}

		return get().createConversation(conversationData);
	}

	const unlockMessagesPagination = () => {
		const unlockPaginationInTheNextStep = get().unlockPaginationInTheNextStep;
		if(unlockPaginationInTheNextStep) {
			set({ isMessagesPaginationBlocked: false, unlockPaginationInTheNextStep: false });
		}
	}

	const stopBOTConversation = () => {
		set(produce((draft) => {
			draft.botConversationSettings.isStopped = true;
		}));
		localStorage.setItem(conversationLocalStorageKeys.isBotConversationStopped, JSON.stringify(true));
	}

	const startBOTConversation = async (): Promise<boolean> => {
		const selectedConversation = get().selectedConversation;

		if(!selectedConversation) {
			return false;
		}

		const response = await getNewConversationSessionApi(selectedConversation._id);
		
		if(response.isFetched && response.data) {
			set(produce((draft: ConversationsState) => {
				draft.isMessagesPaginationBlocked = true;
				draft.unlockPaginationInTheNextStep = true;
				draft.botConversationSettings.isStopped = false;
				const selectedConversationIndex = draft.conversations.findIndex((conversation) => conversation._id === response.data._id);
				draft.conversations.splice(selectedConversationIndex, 1, response.data);
				draft.selectedConversation = response.data;
				localStorage.setItem(conversationLocalStorageKeys.isBotConversationStopped, JSON.stringify(false));
			}));
		}

		return true;
	}

	const toggleConversationFetchingFlag = () => {
		set({ isConversationFetching: !get().isConversationFetching });
	}

	const toggleMessagesFetchingFlag = () => {
		set({ isMessagesListFetching: !get().isMessagesListFetching });
	}

	const createConversation = async (conversationDto: IConversationData): Promise<boolean> => {
		set({ isConversationFetching: true });
		const { isFetched, data }: { isFetched: boolean, data: IConversation } = await createConversationApi(conversationDto);
		
		if(!isFetched || !data || !data._id) {
			return false;
		}
		
		set(produce((draft: ConversationsState) => {
			const conversationIndex = draft.conversations.findIndex((_conversation) => _conversation._id === data._id);

			if(conversationIndex >= 0) {
				draft.conversations.splice(conversationIndex, 1, data);
			}

			if(conversationIndex < 0) {
				draft.conversations.push(data);
			}
		}));
		
		selectConversation(data);
		set({ isConversationFetching: false });
		return true;
	}

	const getMessagesPaginationPage = async () => {
		const selectedConversation = get().selectedConversation;
		const isLastPaginationPage = get().isLastPaginationPage;
		const isMessagesListFetching = get().isMessagesListFetching;
		const isMessagesPaginationBlocked = get().isMessagesPaginationBlocked;
		const unlockPaginationInTheNextStep = get().unlockPaginationInTheNextStep;

		if(unlockPaginationInTheNextStep) {
			return unlockMessagesPagination();
		}

		if(isLastPaginationPage || isMessagesPaginationBlocked) {
			set({ isMessagesListFetching: false });
			return false;
		}

		if(!selectedConversation || isMessagesListFetching) {
			return false;
		}
		
		set({ isMessagesListFetching: true });

		const offset = get().messagesPaginationOffset;
		const { isFetched, data }: { isFetched: boolean, data: IConversation } = await queryConversationByIdAPI(selectedConversation._id, offset + 1);

		if(isFetched && data && Array.isArray(data.messages) && data.messages.length) {
			set(produce(draft => {
				draft.selectedConversation.messages.push(...data.messages);
				draft.messagesPaginationOffset += 1;
			}));

			set({ isMessagesListFetching: false });
			return true;
		}

		set({ 
			isLastPaginationPage: true,
			isMessagesListFetching: false,
		});

		return false;
	}

	const addMessage = async (message: IInputMessage, userData: IUser) => {
		const conversations = get().conversations;
		const isConversationWaitingStuff = get().isConversationWaitingStuff;

		if(isConversationWaitingStuff && !message.isForce) {
			return;
		};
		
		const conversationIndex = conversations.findIndex((conversation: IConversation) => {
			return conversation._id === message.conversationId;
		});

		if(conversationIndex < 0) {
			const { isFetched, data } = await queryConversationByIdAPI(message.conversationId);
			if(isFetched && data) {
				data.messages.push(message);
				set(produce((draft: ConversationsState) => {
					// data.messages.push(message);
					data.unreadedMessagesCount = message.unreadedMessagesCount || 0;
					draft.unreadedMessagesCount += (message.unreadedMessagesCount || 0);
					draft.conversations.push(data);
				}));
			};

			return false;
		};

		if(conversationIndex >= 0) {
			set(produce((draft: ConversationsState) => {
				draft.unreadedMessagesCount += (message.unreadedMessagesCount || 0);
				draft.conversations[conversationIndex].unreadedMessagesCount = message.unreadedMessagesCount || 0;
				draft.conversations[conversationIndex].messages.push(message);
				if(draft.selectedConversation && draft.selectedConversation._id === draft.conversations[conversationIndex]._id) {
					draft.selectedConversation.messages = draft.conversations[conversationIndex].messages;
					draft.selectedConversation.unreadedMessagesCount = draft.conversations[conversationIndex].unreadedMessagesCount;
				}
			}));
		};

		if(userData?._id !== message.sender._id) {
			return true
		};

		return false;
	};

	const generateOutputMessage = (messageText: string): IOutputMessage | null => {
		const userData = useUserStore.getState().userData;
		const selectedConversation = get().selectedConversation;

		if(!selectedConversation || !userData) {
			return null;
		}

		return {
			text: messageText,
			senderId: userData._id,
			conversationId: selectedConversation._id,
			recipients: Array.from(new Set(selectedConversation.recipients)),
		}
	}

	const addCloudMessage = async (message: IInputMessage) => {
		const selectedConversation = get().selectedConversation;
		const isChatOpened = useSettingsStore.getState().isChatOpened;

		if(selectedConversation && selectedConversation._id === message.conversationId && isChatOpened) {
			return true;
		}

		const conversations = get().conversations;
		const conversationIndex = conversations.findIndex((_conversation) => _conversation._id === message.conversationId);

		if(conversationIndex < 0) {
			const { isFetched, data } = await queryConversationByIdAPI(message.conversationId);
			if(isFetched && data.data) {
				set(produce((draft) => {
					draft.messagesCloudState.list.push({
						...message,
						recipientData: data.recipientsDataById[message.sender._id]
					});
				}));
			}

			return true;
		}

		set(produce((draft) => {
			draft.messagesCloudState.list.push({
				...message,
				recipientData: conversations[conversationIndex].recipientsDataById[message.sender._id]
			})
		}));

		return true;
	}
	
	const closeCloudMessage = (messageIndex: number) => {
		const list = get().messagesCloudState.list;

		if(!list[messageIndex]) {
			return false;
		}

		const message = list[messageIndex];

		if(message) {
			set(produce((draft) => {
				draft.messagesCloudState.list.splice(messageIndex, 1);
			}));
		}
	}

	const closeAllSimilarCloudMessages = (messageIndex: number) => {
		const list = get().messagesCloudState.list;

		if(!list[messageIndex]) {
			return false;
		};

		set(produce((draft) => {
			draft.messagesCloudState.list = draft.messagesCloudState.list.reduce((acc: IInputMessage[], _message: IInputMessage, _messageIndex: number) => {
				if(list[messageIndex].conversationId !== _message.conversationId) {
					acc.push(_message);
				};
	
				return acc;
			}, []);
		}));
	};

	const queryConversationByIdAndSelectIt = async (conversationId: string, forceFetch: boolean = false) => {
		let conversation = get().conversations.find((_conversation) => _conversation._id === conversationId);

		if(!conversation || forceFetch) {
			const response = await queryConversationByIdAPI(conversationId);
			conversation = response.data;
		}

		if(conversation) {
			selectConversation(conversation, true);
		}
	}

	const readConversationMessages = async () => {
		const selectedConversation = get().selectedConversation;

		if(!selectedConversation) {
			return;
		}

		const { isFetched, data } = await readConversationMessagesApi(selectedConversation._id);

		if(isFetched) {
			const conversations = get().conversations;
			const conversationIndex = conversations.findIndex((_conversation) => _conversation._id === selectedConversation._id);
			set(produce((draft) => {
				const newConversation = draft.conversations[conversationIndex];
				newConversation.unreadedMessagesCount = data;
				draft.conversations.splice(conversationIndex, 1, newConversation);
			}));
			get().calculateUnreadedMessagesCount();
		}
	}

	const calculateUnreadedMessagesCount = () => {
		const list = get().conversations;
		if(Array.isArray(list)) {
			set(produce((draft) => {
				draft.unreadedMessagesCount = draft.conversations.reduce((acc: number, _conversation: IConversation) => {
					acc += _conversation.unreadedMessagesCount || 0;
					return acc;
				}, 0)
			}));
		}
	}

	const increaseUnreadedMessagesCount = () => {
		set({ unreadedMessagesCount: get().unreadedMessagesCount + 1 });
	}

	const updateIsConversationWaitingStuffState = (prop: boolean): void => {
		set({
			isConversationWaitingStuff: prop,
		});
	}

	const scrollIntoView = (element: HTMLElement, behavior: ScrollBehavior = "auto", block: ScrollLogicalPosition = "end", isForce: boolean = false) => {
		const isConversationWaitingStuff = get().isConversationWaitingStuff;

		if(isForce || !isConversationWaitingStuff) {
			element?.scrollIntoView({ block, behavior });
		}
	}

	const sendMessageToServer = (message: IInputMessage) => {
		const isConversationWaitingStuff = get().isConversationWaitingStuff;
		
		if(!isConversationWaitingStuff && message.isCommandMenuOption && !message.link) {
			const socket: Socket | null = useSocketStore.getState().socket;
			const newMessage: IOutputMessage | null = generateOutputMessage(message.text);
			
			if(newMessage && socket && socket.connected) {
				newMessage.link = message.link;
				newMessage.actionType = message.actionType;
				socket.emit('conversation/message', newMessage);
			}
		}
	}

	return {
		botConversationSettings: {
			isStopped: false
		},

		messagesCloudState: {
			list: [],
			addMessage: addCloudMessage,
			closeMessage: closeCloudMessage,
		},

		conversations: [],
		selectedConversation: null,
		messagesPaginationOffset: 1,
		isLastPaginationPage: false,
		isMessagesListFetching: false,
		isConversationFetching: false,
		conversationsPaginationOffset: 1,
		isConversationWaitingStuff: false,
		isMessagesPaginationBlocked: false,
		unlockPaginationInTheNextStep: false,
		unreadedMessagesCount: 0,
		
		addMessage,
		scrollIntoView,
		selectConversation,
		lockBotConversation,
		createConversation,
		stopBOTConversation,
		sendMessageToServer,
		startBOTConversation,
		queryConversationsList,
		generateOutputMessage,
		readConversationMessages,
		unlockMessagesPagination,
		createConversationWithBOT,
		getMessagesPaginationPage,
		toggleMessagesFetchingFlag,
		closeAllSimilarCloudMessages,
		increaseUnreadedMessagesCount,
		calculateUnreadedMessagesCount,
		toggleConversationFetchingFlag,
		queryConversationByIdAndSelectIt,
		updateIsConversationWaitingStuffState,
	}
});