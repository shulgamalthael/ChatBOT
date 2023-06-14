/* @immer */
import { produce } from "immer";

/* @zustand */
import { create } from "zustand";

/* @interfaces */
import { IUser } from "../../interfaces/user.interface";
import { IConversation, IInputMessage, IOutputMessage, IConversationData } from "../../interfaces/conversation.interface";

/* @api */
import { createConversationApi, endSupportingByStaffAPI, getNewConversationSessionApi, queryConversationByIdAPI, queryConversationsListAPI, QueryConversationsListParams, readConversationMessagesApi, startSupportingByStaffAPI } from "../../api/api";
import useSocketStore, { IUserData } from "../socket/socket";
import { audioList, useSettingsStore } from "../settings/settings";
import { Socket } from "socket.io-client";
import { useUserStore } from "../user/user";
import { useCloudStore } from "../cloud/cloud";


export const conversationLocalStorageKeys = {
	isBotConversationStopped: "wl-cb-isBotConversationStopped"
}

interface IBotConversationSettings {
	isStopped: boolean;
}

interface IMessagesCloudState {
	list: IInputMessage[];
	closeMessage: (messageIndex: number) => void;
	addMessage: (message: IInputMessage, isChatOpened: boolean) => void;
}

interface ConversationsState {
	isLastPaginationPage: boolean;
	conversations: IConversation[];
	messagesCloudState: IMessagesCloudState;
	botConversationSettings: IBotConversationSettings;

	isConversationFetching: boolean;
	isMessagesListFetching: boolean;
	isConversationSupportingDataFetched: boolean;
	isConversationSupportingDataFetching: boolean;

	messagesPaginationOffset: number;
	isMessagesPaginationBlocked: boolean;

	isConversationLocked: boolean;
	isConversationWaitingStaff: boolean;
	isLastMessageBeingUserForm: boolean;
	isConversationLockedForStaff: boolean;
	isConversationSupportedByStaff: boolean;

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
	addMessage: (message: IInputMessage) => Promise<boolean>;
	selectConversation: (conversation: IConversation) => void;
	closeAllSimilarCloudMessages: (messageIndex: number) => void;

	lockMessagesPagination: () => void;
	refreshMessagesPagination: () => void;
	updateIsLastMessageBeingUserForm: () => void;
	endConversationSupportingByStaff: () => Promise<void>;
	startConversationSupportingByStaff: () => Promise<void>;
	updateIsConversationLockedState: (prop: boolean) => void;
	updateIsConversationWaitingStaffState: (prop: boolean) => void;
	updateIsConversationLockedForStaffState: (prop: boolean) => void;
	updateIsConversationSupportedByStaffState: (prop: boolean) => void;
	updateIsConversationSupportingDataFetching: (prop: boolean) => void;
	processInputConversationMessage: (message: IInputMessage) => Promise<void>;

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
			}));
		}
	}

	const selectConversation = (conversation: IConversation, isForce: boolean = false) => {
		const selectedConversation = get().selectedConversation;

		if(!isForce && selectedConversation && conversation._id === selectedConversation._id) {
			return true;
		}

		if(isForce || !selectedConversation || conversation._id !== selectedConversation._id) {
			const conversations = get().conversations;
			const conversationIndex = conversations.findIndex((_conversation) => _conversation._id === conversation._id);

			set({
				messagesPaginationOffset: 1,
				isLastPaginationPage: false,
				selectedConversation: conversation,
			});

			if(conversationIndex < 0) {
				set(produce((draft) => {
					draft.conversations.push(conversation);
				}));
				
				return true;
			}

			if(conversationIndex >= 0) {
				set(produce((draft) => {
					draft.conversations.splice(conversationIndex, 1, conversation);
				}));
				
				return true;
			};
		};

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

	const lockMessagesPagination = () => {
		set({ isMessagesPaginationBlocked: true, unlockPaginationInTheNextStep: false });
	}

	const unlockMessagesPagination = () => {
		const isMessagesPaginationBlocked = get().isMessagesPaginationBlocked;
		const unlockPaginationInTheNextStep = get().unlockPaginationInTheNextStep;

		if(isMessagesPaginationBlocked && unlockPaginationInTheNextStep) {
			set({ isMessagesPaginationBlocked: false, unlockPaginationInTheNextStep: false, messagesPaginationOffset: 1, isLastPaginationPage: false });
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
				draft.messagesPaginationOffset = 1;
				draft.isMessagesPaginationBlocked = true;
				draft.unlockPaginationInTheNextStep = true;
				draft.botConversationSettings.isStopped = false;
				const selectedConversationIndex = draft.conversations.findIndex((conversation) => conversation._id === response.data._id);
				draft.conversations.splice(selectedConversationIndex, 1, response.data);
				draft.selectedConversation = response.data;
				localStorage.setItem(conversationLocalStorageKeys.isBotConversationStopped, JSON.stringify(false));
			}));
			get().refreshMessagesPagination();
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
		
		get().selectConversation(data);
		set({ isConversationFetching: false });
		return true;
	}

	const getMessagesPaginationPage = async () => {
		const selectedConversation = get().selectedConversation;
		const isLastPaginationPage = get().isLastPaginationPage;
		const isMessagesListFetching = get().isMessagesListFetching;
		const isMessagesPaginationBlocked = get().isMessagesPaginationBlocked;

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

		if(isFetched && data && Array.isArray(data.messages) && !!data.messages.length) {
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

	const processInputConversationMessage = async (message: IInputMessage): Promise<void> => {
		const selectedConversation = get().selectedConversation;
		const isChatOpened = useSettingsStore.getState().isChatOpened;

		const isMessageAdded = await get().addMessage(message);

		if(isMessageAdded) {
			if(!isChatOpened || selectedConversation && selectedConversation._id !== message.conversationId) {
				await useCloudStore.getState().addCloud(message, "message");
			}
			useSettingsStore.getState().playAudio(audioList.NOTIFICATION);
		};
	};

	const addMessage = async (message: IInputMessage): Promise<boolean> => {
		const conversations = get().conversations;
		const userData = useUserStore.getState().userData;
		const selectedConversation = get().selectedConversation;

		const userRole = userData?.role || "guest";

		let conversation: IConversation | null = null;

		const conversationIndex = conversations.findIndex((conversation: IConversation) => {
			return conversation._id === message.conversationId;
		});

		if(conversationIndex < 0) {
			const { isFetched, data } = await queryConversationByIdAPI(message.conversationId);

			console.log('addMessage', { message, conversationIndex });

			if(isFetched && data) {
				conversation = data;
			};
		};

		if(conversationIndex >= 0) {
			conversation = conversations[conversationIndex];
		};

		if(!conversation || conversation.isConversationWaitingStaff && !message.isForce) {
			return false;
		};

		const isCommonUser = userRole === "guest" || userRole === "user";
		const canAddMessage = (conversation: IConversation) => conversation.isConversationWithAssistant
			?	conversation._id === message.conversationId
			:	!isCommonUser
		;

		if(conversationIndex < 0) {
			set(produce((draft: ConversationsState) => {
				if(conversation) {
					draft.unreadedMessagesCount += conversation.unreadedMessagesCount || 0;
					draft.conversations.push(conversation);
				}
			}));

			if(selectedConversation?._id === message.conversationId) {
				get().readConversationMessages();
			};
		};

		if(conversationIndex >= 0) {
			set(produce((draft: ConversationsState) => {
				// draft.unreadedMessagesCount += (message.unreadedMessagesCount || 0);
				// draft.conversations[conversationIndex].unreadedMessagesCount = message.unreadedMessagesCount || 0;
				draft.conversations[conversationIndex].messages.push(message);
				draft.conversations[conversationIndex].unreadedMessagesCount += 1;
				if(draft.selectedConversation && draft.selectedConversation._id === draft.conversations[conversationIndex]._id) {
					draft.selectedConversation.messages = draft.conversations[conversationIndex].messages;

					draft.selectedConversation.unreadedMessagesCount = draft.conversations[conversationIndex].unreadedMessagesCount;
				};
				draft.unreadedMessagesCount += 1;
			}));

			if(selectedConversation?._id === message.conversationId) {
				get().readConversationMessages();
			};
		};

		// if(userData?._id !== message.sender._id) {
		// 	return true
		// };

		return canAddMessage(conversation);
	};

	const generateOutputMessage = (messageText: string): IOutputMessage | null => {
		const userData = useUserStore.getState().userData;
		const selectedConversation = get().selectedConversation;
		const isConversationSupportedByStaff = get().isConversationSupportedByStaff;

		if(!selectedConversation || !userData) {
			return null;
		};

		return {
			text: messageText,
			senderId: userData._id,
			isConversationSupportedByStaff,
			conversationId: selectedConversation._id,
			recipients: Array.from(new Set(selectedConversation.recipients)),
		};
	};

	const addCloudMessage = async (message: IInputMessage) => {
		const selectedConversation = get().selectedConversation;
		const isChatOpened = useSettingsStore.getState().isChatOpened;

		if(selectedConversation && selectedConversation._id === message.conversationId && isChatOpened) {
			return true;
		};

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
			};

			return true;
		};

		set(produce((draft) => {
			draft.messagesCloudState.list.push({
				...message,
				recipientData: conversations[conversationIndex].recipientsDataById[message.sender._id]
			});
		}));

		return true;
	};
	
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

			if(conversationIndex >= 0) {
				set(produce((draft) => {
					draft.conversations[conversationIndex].unreadedMessagesCount = data;
				
					if(draft.selectedConversation?._id === draft.conversations[conversationIndex]._id) {
						draft.selectConversation.unreadedMessagesCount = data;
					}
	
					draft.conversations.splice(conversationIndex, 1, draft.conversations[conversationIndex]);
				}));
	
				get().calculateUnreadedMessagesCount();
			}
		}
	}

	const calculateUnreadedMessagesCount = () => {
		const list = get().conversations;
		const userData = useUserStore.getState().userData;

		if(Array.isArray(list) && userData) {
			set(produce((draft) => {
				draft.unreadedMessagesCount = draft.conversations.reduce((acc: number, _conversation: IConversation) => {
					if(userData.role !== "staff" && _conversation.recipients.includes(userData.businessId)) {
						acc += _conversation.unreadedMessagesCount || 0;
					}

					if(userData.role === "staff") {
						acc += _conversation.unreadedMessagesCount || 0;
					}

					return acc;
				}, 0);
			}));
		}
	}

	const increaseUnreadedMessagesCount = () => {
		set({ 
			unreadedMessagesCount: get().unreadedMessagesCount + 1 
		});
	}

	const updateIsConversationLockedState = (): void => {
		const isConversationLockedForStaff = get().isConversationLockedForStaff;

		const isLocked = isConversationLockedForStaff;

		set({
			isConversationLocked: isLocked,
		});
	}

	const updateIsConversationWaitingStaffState = (prop: boolean): void => {
		set({
			isConversationWaitingStaff: prop,
		});
	}

	const updateIsConversationSupportedByStaffState = (prop: boolean): void => {
		set({
			isConversationSupportedByStaff: prop,
		});
	}

	const updateIsConversationLockedForStaffState = (): void => {
		const userData = useUserStore.getState().userData;
		const selectedConversation = get().selectedConversation;

		const isLocked = Boolean(
			userData?.role === "staff" &&
			userData?._id !== selectedConversation?.creator && 
			selectedConversation && 
			!selectedConversation?.isConversationWaitingStaff && 
			!selectedConversation?.isConversationSupportedByStaff &&
			selectedConversation?.isConversationWithAssistant
		);

		set({
			isConversationLockedForStaff: isLocked,
		});
	}

	const startConversationSupportingByStaff = async () => {
		updateIsConversationSupportingDataFetching(true);
		const userData = useUserStore.getState().userData;
		const selectedConversation = get().selectedConversation;

		if(!userData || userData.role !== "staff" || !selectedConversation) {
			updateIsConversationSupportingDataFetching(false);
			return;
		};


		await startSupportingByStaffAPI(selectedConversation._id, userData._id);
		updateIsConversationSupportingDataFetching(false);
	};

	const endConversationSupportingByStaff = async () => {
		updateIsConversationSupportingDataFetching(true);
		const userData = useUserStore.getState().userData;
		const selectedConversation = get().selectedConversation;

		if(!userData || userData.role !== "staff" || !selectedConversation) {
			updateIsConversationSupportingDataFetching(false);
			return;
		};

		await endSupportingByStaffAPI(selectedConversation._id);
		updateIsConversationSupportingDataFetching(false);
	};

	const scrollIntoView = (element: HTMLElement, behavior: ScrollBehavior = "auto", block: ScrollLogicalPosition = "end", isForce: boolean = false) => {
		const isConversationWaitingStaff = get().isConversationWaitingStaff;

		if(isForce || !isConversationWaitingStaff) {
			element?.scrollIntoView({ block, behavior });
		}
	}

	const sendMessageToServer = (message: IInputMessage) => {
		const isConversationLocked = get().isConversationLocked;
		const isConversationWaitingStaff = get().isConversationWaitingStaff;
		const isConversationSupportedByStaff = get().isConversationSupportedByStaff;

		if(isConversationSupportedByStaff || isConversationLocked) {
			return;
		}

		if(!isConversationWaitingStaff && message.isCommandMenuOption) {
			const socket: Socket | null = useSocketStore.getState().socket;
			const newMessage: IOutputMessage | null = generateOutputMessage(message.text);
			
			if(newMessage && socket && socket.connected) {
				newMessage.link = message.link;
				newMessage.actionType = message.actionType;
				socket.emit('conversation/message', newMessage);
			}
		}
	}

	const updateIsConversationSupportingDataFetching = (prop: boolean) => {
		set({
			isConversationSupportingDataFetched: !prop,
			isConversationSupportingDataFetching: prop,
		});
	}

	const refreshMessagesPagination = () => {
		set({ messagesPaginationOffset: 1 });
	}

	const updateIsLastMessageBeingUserForm = () => {
		const selectedConversation = get().selectedConversation;

		const messages = selectedConversation?.messages || [];
		const isLastMessageBeingUserForm = messages[messages.length - 1]?.actionType === 'userForm';

		set({ isLastMessageBeingUserForm });
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
		unreadedMessagesCount: 0,
		selectedConversation: null,
		messagesPaginationOffset: 1,
		isLastPaginationPage: false,
	
		isMessagesListFetching: false,
		isConversationFetching: false,
		isLastMessageBeingUserForm: false,
		isConversationSupportingDataFetched: false,
		isConversationSupportingDataFetching: false,

		conversationsPaginationOffset: 1,

		isConversationLocked: false,
		isConversationWaitingStaff: false,
		isMessagesPaginationBlocked: false,
		isConversationLockedForStaff: false,

		unlockPaginationInTheNextStep: false,
		isConversationSupportedByStaff: false,
		
		addMessage,
		scrollIntoView,
		selectConversation,
		lockBotConversation,
		createConversation,
		stopBOTConversation,
		sendMessageToServer,
		startBOTConversation,
		lockMessagesPagination,
		queryConversationsList,
		generateOutputMessage,
		readConversationMessages,
		unlockMessagesPagination,
		refreshMessagesPagination,
		createConversationWithBOT,
		getMessagesPaginationPage,
		toggleMessagesFetchingFlag,
		closeAllSimilarCloudMessages,
		increaseUnreadedMessagesCount,
		calculateUnreadedMessagesCount,
		toggleConversationFetchingFlag,
		processInputConversationMessage,
		queryConversationByIdAndSelectIt,

		updateIsConversationLockedState,
		updateIsLastMessageBeingUserForm,
		endConversationSupportingByStaff,
		startConversationSupportingByStaff,
		updateIsConversationWaitingStaffState,
		updateIsConversationLockedForStaffState,
		updateIsConversationSupportedByStaffState,
		updateIsConversationSupportingDataFetching,
	}
});
