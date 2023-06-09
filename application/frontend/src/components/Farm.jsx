
/* @react */
import React, { useCallback, useEffect, useState } from "react";
import { useLocation } from "react-router-dom";

/* @stores */
import { useUserStore } from "../stores/user/user";
import useSocketStore from "../stores/socket/socket";
import { useUsersStore } from "../stores/users/users";
import { useBotSettings } from "../stores/botSettings/botSettingsStore";
import { audioList, useSettingsStore } from "../stores/settings/settings";
import { useConversationsStore } from "../stores/conversations/conversations";
import { useNotificationsStore } from "../stores/notifications/notificationsStore";
import { useWindows } from "../stores/windows/windows";

const DeployingFarm = () => {
	const isDeployed = useSettingsStore((state) => state.isDeployed);
	const isAuthorized = useSettingsStore((state) => state.isAuthorized);
	const generalSettings = useBotSettings((state) => state.generalSettings);
	const isEnabled = useBotSettings((state) => state.generalSettings.enabled);
	const deployApplication = useSettingsStore(state => state.deployApplication);
	const collapseApplication = useSettingsStore((state) => state.collapseApplication);
	const isGeneralSettingsFetched = useBotSettings((state) => state.isGeneralSettingsFetched);

	useEffect(() => {
		const isValid = isAuthorized && isGeneralSettingsFetched && isEnabled;

		if(!isValid) {
			collapseApplication();
		}

		if(isValid) {
			const timer = generalSettings.showingChatTimer * 1000;
			setTimeout(() => {
				deployApplication();
			}, timer);
		}
	}, [isEnabled, isDeployed, isAuthorized, isGeneralSettingsFetched]);

	console.log("Deploying Farm Rendered!");

	return null;
}

const SocketFarm = () => {
	const socket = useSocketStore((state) => state.socket);
	const playAudio = useSettingsStore((state) => state.playAudio);
	const queryOnlineUsersList = useUsersStore((state) => state.queryOnlineUsersList);
	const processSocketConnection = useSocketStore((state) => state.processSocketConnection);
	const processInputNotification = useNotificationsStore((state) => state.processInputNotification);
	const processInputConversationMessage = useConversationsStore((state) => state.processInputConversationMessage);
	const processNotificationsListUpdating = useNotificationsStore((state) => state.processNotificationsListUpdating);
	const queryConversationByIdAndSelectIt = useConversationsStore((state) => state.queryConversationByIdAndSelectIt);

	console.log("Socket's Farm Rendered!");

	const signOpeningNotification = () => {
		const callback = () => {
			playAudio(audioList.OPENING);
			window.removeEventListener("click", callback);
		}

		window.addEventListener("click", callback);
	}

	const processConversationUpdating = (message) => {
		const parsedMesasge = JSON.parse(message || "null");
		if(!parsedMesasge.conversationId) {
			return;
		}

		queryConversationByIdAndSelectIt(parsedMesasge.conversationId, true);
	}

	const submitSocketEvents = () => {
		if(!socket) {
			return;
		}

		socket.on("user-connection", queryOnlineUsersList);
		socket.on("user-disconnection", queryOnlineUsersList);
		socket.on("user/notification", processInputNotification);
		socket.on("conversation/update", processConversationUpdating);
		socket.on("notification/list/update", processNotificationsListUpdating);
		socket.on("conversation/message/client", processInputConversationMessage);
	};

	useEffect(() => {
		submitSocketEvents();
	}, [socket]);

	useEffect(() => {
		signOpeningNotification();
	}, [signOpeningNotification]);

	useEffect(() => {
		processSocketConnection();
	}, []);

	return null;
}

const UsersFarm = () => {
	const queryStaffList = useUsersStore((state) => state.queryStaffList);
	const queryOnlineUsersList = useUsersStore((state) => state.queryOnlineUsersList);

	console.log("Users's Farm Rendered!");
	
	useEffect(() => {
		queryStaffList();
	}, [queryStaffList]);
	
	useEffect(() => {
		queryOnlineUsersList();
	}, [queryOnlineUsersList]);

	return null;
}

const BOTFarm = () => {

	return null;
}

const UserFarm = () => {
	const userData = useUserStore((state) => state.userData);
	const fetchUserData = useUserStore((state) => state.fetchUserData);
	const updateAuthorizationState = useUserStore((state) => state.updateAuthorizationState);

	useEffect(() => {
		fetchUserData();
	}, [fetchUserData]);

	useEffect(() => {
		updateAuthorizationState();
	}, [userData, updateAuthorizationState]);
	
	console.log("User's Farm Rendered!");

	return null;
}

const ConversationsFarm = () => {
	const [conversationId, setConversationId] = useState(null);
	const socket = useSocketStore((state) => state.socket);
	const userData = useUserStore((state) => state.userData);
	const hideMainMenu = useWindows((state) => state.hideMainMenu);
	const conversations = useConversationsStore((state) => state.conversations);
	const offset = useConversationsStore((state) => state.conversationsPaginationOffset);
	const lockBotConversation = useConversationsStore((state) => state.lockBotConversation);
	const selectedConversation = useConversationsStore((state) => state.selectedConversation);
	const queryConversationsList = useConversationsStore((state) => state.queryConversationsList);
	const readConversationMessages = useConversationsStore((state) => state.readConversationMessages);
	const createConversationWithBOT = useConversationsStore((state) => state.createConversationWithBOT);
	const refreshMessagesPagination = useConversationsStore((state) => state.refreshMessagesPagination);
	const calculateUnreadedMessagesCount = useConversationsStore((state) => state.calculateUnreadedMessagesCount);
	const updateIsConversationLockedState = useConversationsStore((state) => state.updateIsConversationLockedState);
	const updateIsConversationWaitingStaffState = useConversationsStore((state) => state.updateIsConversationWaitingStaffState);
	const updateIsConversationSupportedByStaff = useConversationsStore((state) => state.updateIsConversationSupportedByStaffState);
	const updateIsConversationLockedForStaffState = useConversationsStore((state) => state.updateIsConversationLockedForStaffState);

	const UCqueryConversationsList = useCallback(() => {
		if(userData) {
			queryConversationsList({ offset }, userData);
		}
	}, [userData, offset, queryConversationsList]);

	const createConversationWithBOTCallback = useCallback(async () => {
		const isCreated = await createConversationWithBOT();

		if(!isCreated) {
			setTimeout(createConversationWithBOTCallback, 5000);
		}
	}, [createConversationWithBOT]);

	useEffect(() => {
		calculateUnreadedMessagesCount();
	}, [conversations, calculateUnreadedMessagesCount]);

	useEffect(() => {
		updateIsConversationLockedForStaffState();
	}, [selectedConversation, updateIsConversationLockedForStaffState]);

	useEffect(() => {
		updateIsConversationLockedState();
	}, [selectedConversation, updateIsConversationLockedState]);

	useEffect(() => {
		hideMainMenu();
	}, [selectedConversation, hideMainMenu]);

	useEffect(() => {
		refreshMessagesPagination();
	}, [conversationId, refreshMessagesPagination]);

	useEffect(() => {
		if(selectedConversation?._id !== conversationId) {
			setConversationId(selectedConversation?._id || null);
		}
	}, [selectedConversation, setConversationId]);

	useEffect(() => {
		const isWaitingStaff = selectedConversation?.isConversationWaitingStaff || false;
		const isSupportedByStaff = selectedConversation?.isConversationSupportedByStaff || false;

		updateIsConversationWaitingStaffState(isWaitingStaff);
		updateIsConversationSupportedByStaff(isSupportedByStaff);
	}, [selectedConversation, updateIsConversationWaitingStaffState, updateIsConversationSupportedByStaff]);

	useEffect(() => {
		lockBotConversation(userData);
	}, [userData, selectedConversation]);

	useEffect(() => {
		readConversationMessages();
	}, [conversationId]);

	useEffect(() => {
		UCqueryConversationsList()
	}, [UCqueryConversationsList]);

	useEffect(() => {
		createConversationWithBOTCallback();
	}, [createConversationWithBOTCallback]);

	useEffect(() => {
		if(selectedConversation?.recipients?.includes(userData?.businessId) && !selectedConversation?.messages?.length) {
			socket.emit("bot/sendGreeting", JSON.stringify({ conversationId: selectedConversation._id }));
		}
	}, [userData, selectedConversation]);

	console.log("Conversation's Farm Rendered!");

	return null;
}

const CompanionFarm = () => {
	console.log("Companion's Farm Rendered!");

	return null;
}

const LiveAgentFarm = () => {
	const getLiveAgentSettings = useBotSettings((state) => state.getLiveAgentSettings);

	useEffect(() => {
		getLiveAgentSettings();
	}, [getLiveAgentSettings]);
	
	console.log("Live Agent Farm Rendered!");

	return null;
}

const GeneralSettingsFarm = () => {
	const getGeneralSettings = useBotSettings((state) => state.getGeneralSettings);

	const getGeneralSettingsCallback = useCallback(async () => {
		const isFetched = await getGeneralSettings();

		if(!isFetched) {
			setTimeout(getGeneralSettingsCallback, 5000);
		}
	}, [getGeneralSettings]);

	useEffect(() => {
		getGeneralSettingsCallback();
	}, [getGeneralSettingsCallback]);

	console.log("General Settings Farm Rendered!");

	return null;
}

const BotSettingsFarm = () => {
	const location = useLocation();

	const allowPagesList = useBotSettings((state) => state.allowPages.list);
	const getCommandsList = useBotSettings((state) => state.getCommandsList);
	const checkCommandsList = useBotSettings((state) => state.checkCommandsList);
	const deployApplication = useSettingsStore((state) => state.deployApplication);
	const collapseApplication = useSettingsStore((state) => state.collapseApplication);
	const getAllowPagesList = useBotSettings((state) => state.allowPages.getPagesList);
	const commandsList = useBotSettings((state) => state.commandsSettings.commandsList);
	const checkPageAccess = useBotSettings((state) => state.allowPages.checkPageAccess);
	const changePageAccessState = useBotSettings((state) => state.changePageAccessState);

	const getCommandsListCallback = useCallback(async () => {
		const isFetched = await getCommandsList();

		if(!isFetched) {
			setTimeout(getCommandsListCallback, 5000);
		}
	}, [getCommandsList]);

	useEffect(() => {
		getAllowPagesList();
	}, [getAllowPagesList]);

	useEffect(() => {
		checkCommandsList();
	}, [commandsList, checkCommandsList]);

	useEffect(() => {
		getCommandsListCallback();
	}, [getCommandsListCallback]);

	useEffect(() => {
		const isAccessed = checkPageAccess(location.pathname);

		if(!isAccessed) {
			return changePageAccessState(false);
		}

		if(isAccessed) {
			changePageAccessState(true);
		}
	}, [allowPagesList, location.pathname, checkPageAccess]);

	return null;
}

const NotificationsFarm = () => {
	const queryNotificationsList = useNotificationsStore((state) => state.queryNotificationsList);

	useEffect(() => {
		queryNotificationsList();
	}, [queryNotificationsList]);

	return null;
}

const UnauthorizedPart = () => {
	return(
		<React.Fragment>
			<UserFarm />
			<DeployingFarm />
		</React.Fragment>
	)
}

const AuthorizedPart = () => {
	const socket = useSocketStore((state) => state.socket);
	const isAuthorized = useSettingsStore((state) => state.isAuthorized);

	if(!isAuthorized || !socket) {
		return null;
	}

	return(
		<React.Fragment>
			<LiveAgentFarm />
			<BotSettingsFarm />
			<GeneralSettingsFarm />
		</React.Fragment>
	)
}

const DeployedPart = () => {
	const isDeployed = useSettingsStore((state) => state.isDeployed);

	if(!isDeployed) {
		return null;
	}

	return(
		<React.Fragment>
			<BOTFarm />
			<UsersFarm />
			<CompanionFarm />
			<ConversationsFarm />
			<NotificationsFarm />
		</React.Fragment>
	)
}

const SocketConnectionPart = () => {
	const isAuthorized = useSettingsStore((state) => state.isAuthorized);

	if(!isAuthorized) {
		return null;
	}

	return(
		<SocketFarm />
	)
}

const Farm = () => {
	console.log("Farm Rendered!");

	return(
		<React.Fragment>
			<DeployedPart />
			<AuthorizedPart />
			<UnauthorizedPart />
			<SocketConnectionPart />
		</React.Fragment>
	);
}

export default Farm;
