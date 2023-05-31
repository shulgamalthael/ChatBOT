
/* @react */
import React, { useCallback, useEffect, useMemo } from "react";
import { useLocation } from "react-router-dom";

/* @stores */
import { useUserStore } from "../stores/user/user";
import useSocketStore from "../stores/socket/socket";
import { useUsersStore } from "../stores/users/users";
import { useCloudStore } from "../stores/cloud/cloud";
import { useBotSettings } from "../stores/botSettings/botSettingsStore";
import { audioList, useSettingsStore } from "../stores/settings/settings";
import { useConversationsStore } from "../stores/conversations/conversations";
import { useNotificationsStore } from "../stores/notifications/notificationsStore";
import { useWindows } from "../stores/windows/windows";

const DeployingFarm = () => {
	const isAuthorized = useSettingsStore((state) => state.isAuthorized);
	const generalSettings = useBotSettings((state) => state.generalSettings);
	const deployApplication = useSettingsStore(state => state.deployApplication);
	const isGeneralSettingsFetched = useBotSettings((state) => state.isGeneralSettingsFetched);

	useEffect(() => {
		const isValid = isAuthorized && isGeneralSettingsFetched;
		if(isValid) {
			const timer = generalSettings.showingChatTimer * 1000;
			setTimeout(() => {
				deployApplication();
			}, timer);
		}
	}, [isAuthorized, isGeneralSettingsFetched]);

	console.log("Deploying Farm Rendered!");

	return null;
}

const SocketFarm = () => {
	const socket = useSocketStore((state) => state.socket);
	const playAudio = useSettingsStore((state) => state.playAudio);
	const allowPagesList = useBotSettings((state) => state.allowPages.list);
	const deployApplication = useSettingsStore((state) => state.deployApplication);
	const queryOnlineUsersList = useUsersStore((state) => state.queryOnlineUsersList);
	const collapseApplication = useSettingsStore((state) => state.collapseApplication);
	const checkPageAccess = useBotSettings((state) => state.allowPages.checkPageAccess);
	const processSocketConnection = useSocketStore((state) => state.processSocketConnection);
	const processSocketDisconnection = useSocketStore((state) => state.processSocketDisconnection);
	const processInputNotification = useNotificationsStore((state) => state.processInputNotification);
	const processInputConversationMessage = useConversationsStore((state) => state.processInputConversationMessage);
	const processNotificationsListUpdating = useNotificationsStore((state) => state.processNotificationsListUpdating);
	const queryConversationByIdAndSelectIt = useConversationsStore((state) => state.queryConversationByIdAndSelectIt);

	const location = useLocation();

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

		return () => {
			processSocketDisconnection();
		}
	}, []);

	useEffect(() => {
		const isAccessed = checkPageAccess(location.pathname);

		if(!isAccessed) {
			collapseApplication();
		}

		if(isAccessed) {
			return deployApplication();
		}

		return () => {
			collapseApplication();
		}
	}, [allowPagesList, location, checkPageAccess]);

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
	const fetchUserData = useUserStore((state) => state.fetchUserData);

	useEffect(() => {
		fetchUserData();
	}, [fetchUserData]);
	
	console.log("User's Farm Rendered!");

	return null;
}

const ConversationsFarm = () => {
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
	const calculateUnreadedMessagesCount = useConversationsStore((state) => state.calculateUnreadedMessagesCount);
	const updateIsConversationLockedState = useConversationsStore((state) => state.updateIsConversationLockedState);
	const updateIsConversationWaitingStaffState = useConversationsStore((state) => state.updateIsConversationWaitingStaffState);
	const updateIsConversationSupportedByStaff = useConversationsStore((state) => state.updateIsConversationSupportedByStaffState);
	const updateIsConversationLockedForStaffState = useConversationsStore((state) => state.updateIsConversationLockedForStaffState);

	const conversationId = selectedConversation?._id;

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
		const isWaitingStaff = selectedConversation?.isConversationWaitingStaff || false;
		const isSupportedByStaff = selectedConversation?.isConversationSupportedByStaff || false;

		updateIsConversationWaitingStaffState(isWaitingStaff);
		updateIsConversationSupportedByStaff(isSupportedByStaff);
	}, [selectedConversation, updateIsConversationWaitingStaffState, updateIsConversationSupportedByStaff]);

	useEffect(() => {
		lockBotConversation(userData);
	}, [userData, selectedConversation]);

	useEffect(() => {
		console.log("CONVERSATION ID CHANGED ===>");
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
	const getCommandsList = useBotSettings((state) => state.getCommandsList);
	const checkCommandsList = useBotSettings((state) => state.checkCommandsList);
	const getAllowPagesList = useBotSettings((state) => state.allowPages.getPagesList);
	const commandsList = useBotSettings((state) => state.commandsSettings.commandsList);

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
	const isAuthorized = useSettingsStore((state) => state.isAuthorized);

	if(!isAuthorized) {
		return null;
	}

	return(
		<React.Fragment>
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
			<SocketFarm />
			<CompanionFarm />
			<LiveAgentFarm />
			<BotSettingsFarm />
			<ConversationsFarm />
			<NotificationsFarm />
		</React.Fragment>
	)
}

const Farm = () => {
	console.log("Farm Rendered!");

	return(
		<React.Fragment>
			<DeployedPart />
			<AuthorizedPart />
			<UnauthorizedPart />
		</React.Fragment>
	);
}

export default Farm;
