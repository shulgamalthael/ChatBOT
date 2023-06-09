/* @react */
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef } from "react";

/* @stores */
import { useUserStore } from "../../../stores/user/user";
import { useUsersStore } from "../../../stores/users/users";
import { useWindows } from "../../../stores/windows/windows";
import { useConversationsStore } from "../../../stores/conversations/conversations";

/* @components */
import Avatar from "../../common/Avatar";
import { useNotificationsStore } from "../../../stores/notifications/notificationsStore";
import SaveButton from "../../common/SaveButton";
import CancelButton from "../../common/CancelButton";
import { readNotificationsAPI } from "../../../api/api";
import { getUserStatus } from "../../../scripts/getUserStatus";

const Staff = ({ staff }) => {
	const userData = useUserStore((state) => state.userData);
	const hideMainMenu = useWindows(state => state.hideMainMenu);
	const createConversation = useConversationsStore(state => state.createConversation);

	const UC_CreateConversation = useCallback(async () => {
		const conversationData = { 
			franchiseId: "",
			businessId: "4444",
			recipients: [staff._id],
		}

		const isConversationCreated = await createConversation(conversationData);

		if(isConversationCreated) {
			hideMainMenu();
		}

	}, [staff._id, hideMainMenu, createConversation]);

	const userName = staff._id === userData?._id
		?	`${staff.username} (You)`
		:	staff.username
	;

	return(
		<div onClick={UC_CreateConversation} className="chat-menu-item">
			<div className="h-25 w-25">
				<Avatar avatarUrl={staff.avatarUrl} isOnline={staff.isOnline} />
			</div>
			<div className="chat-menu-item-name">{userName}</div>
		</div>
	)
}

const StaffList = () => {
	const staffList = useUsersStore((state) => state.staffList);
	console.log("Staff List Rendered!");

	if(!Array.isArray(staffList) || !staffList.length) {
		return <div className="color-primary">Staff list is empty.</div>
	}

	return(staffList.map((staff) => <Staff key={staff._id} staff={staff} />))
}

/* make unique for everything application */
const Conversation = ({ conversation }) => {
	const lastMessage = conversation.messages[conversation.messages.length - 1];
	const selectConversation = useConversationsStore(state => state.selectConversation);
	const hideMainMenu = useWindows(state => state.hideMainMenu);

	const UC_SelectConversation = useCallback(() => {
		if(selectConversation(conversation)) {
			hideMainMenu();
		};
	}, [conversation, selectConversation, hideMainMenu]);

	console.log("Conversation Rendered!");

	const { avatarUrl, isOnline } = getUserStatus(conversation);

	return(
		<div onClick={UC_SelectConversation} className="chat-menu-item">
			<div className="h-25 w-25 m-auto">
				<Avatar avatarUrl={avatarUrl} isOnline={isOnline} />
			</div>
			{lastMessage && 
				<div className="chat-menu-item-flexCol">
					<div className="chat-menu-item-name">{conversation.title}</div>
					<div className="chat-menu-item-flex">
						<div className="chat-menu-item-message">
							{`${lastMessage.sender.username}: ${lastMessage.text}`}
						</div>
					</div>
				</div>
			}
			{!lastMessage && <div className="chat-menu-item-name">{conversation.title}</div>}
			<div className="chat-menu-item-counter">{conversation.unreadedMessagesCount}</div>
		</div>
	);
}

const ConversationsList = () => {
	const conversations = useConversationsStore(state => state.conversations);

	console.log("Conversations List Rendered!");

	const UC_SortConversations = useCallback((a, b) => {
		const aHasMessages = Array.isArray(a.messages) && !!a.messages.length;
		const bHasMessages = Array.isArray(b.messages) && !!b.messages.length;

		if(!aHasMessages && !bHasMessages) {
			return 0;
		}

		if(!aHasMessages && bHasMessages) {
			return 1;
		}

		if(aHasMessages && !bHasMessages) {
			return -1;
		}

		return new Date(b.messages[b.messages.length - 1].sendedAt).getTime() - new Date(a.messages[a.messages.length - 1].sendedAt).getTime() > 0
			?		1
			:	 -1
		;
	}, []);

	if(!Array.isArray(conversations) || !conversations.length) {
		return <div className="color-primary">Conversations list is empty.</div>
	}

	return(
		<div className="main-menu-conversationsList">
			{[...conversations].sort(UC_SortConversations).map((conversation) => (
				<Conversation key={conversation._id} conversation={conversation} />
			))}
		</div>
	)
}

const User = ({ user }) => {
	const userAvatarRef = useRef(null);
	const userData = useUserStore((state) => state.userData);
	const createConversation = useConversationsStore(state => state.createConversation);
	const hideMainMenu = useWindows(state => state.hideMainMenu);

	const UC_CreateConversation = useCallback(async () => {
		const conversationData = { 
			franchiseId: "", 
			businessId: "4444", 
			recipients: [user._id],
		}

		if(await createConversation(conversationData)) {
			hideMainMenu();
		}

	}, [user._id, hideMainMenu, createConversation]);

	useLayoutEffect(() => {
		if(userAvatarRef.current && user.avatarUrl) {
			userAvatarRef.current.style.backgroundImage = `url(${user.avatarUrl})`;
		}
	}, [user.avatarUrl]);

	const userName = user._id === userData?._id
		?	`${user.username} (You)`
		:	user.username
	;

	return(
		<div onClick={UC_CreateConversation} className="chat-menu-item">
			<div className="chat-menu-item-avatar">
				<Avatar avatarUrl={user.avatarUrl} isOnline={user.isOnline} />
			</div>
			<div className="chat-menu-item-name">{userName}</div>
		</div>
	)
}

const UsersList = () => {
	const usersList = useUsersStore((state) => state.usersList || []);
	const trueUsersList = useMemo(() => usersList.reduce((acc, user) => {
		if(!acc.find((_user) => _user._id === user._id)) {
			acc.push(user);
		}

		return acc;
	}, []), [usersList]);

	if(!Array.isArray(usersList) || !usersList.length) {
		return <div className="color-primary">Users list is empty.</div>
	}

	console.log("Users List Rendered!");

	return trueUsersList.map((user) => <User key={user._id} user={user} />)
}

const Settings = () => {
	return(
		<div></div>
	)
}

const Notification = ({ notification }) => {
	const accept = useNotificationsStore((state) => state.acceptNotification);
	const decline = useNotificationsStore((state) => state.declineNotification);

	const acceptCallback = useCallback(() => {
		accept(notification);
	}, [notification, accept]);

	const declineCallback = useCallback(() => {
		decline(notification);
	}, [notification, decline]);

	return(
		<div className="chat-menu-item flex-col">
			<div className="flex">
				<div className="chat-menu-item-avatar">
					<Avatar />
				</div>
				<div className="chat-menu-item-name">{notification.title}</div>
			</div>
			<div className="flex flex-start">
				{notification.accept && <SaveButton click={acceptCallback}>Accept</SaveButton>}
				{notification.decline && <CancelButton click={declineCallback} skipMarginBottom>Decline</CancelButton>}
			</div>
		</div>
	)
}

const NotificationsList = () => {
	const notificationsList = useNotificationsStore((state) => state.notificationsList);

	useEffect(() => {
		readNotificationsAPI();
	}, []);

	if(!Array.isArray(notificationsList) || !notificationsList.length) {
		return <div className="color-primary">Notifications list is empty.</div>
	}

	return notificationsList.map((notification) => <Notification key={notification._id} notification={notification} />);
}

const renderTab = (tabState) => {
	if (tabState.show) {
		switch (tabState.tabName) {
			case "settings": return <Settings />;
			case "usersList": return <UsersList />;
			case "staffList": return <StaffList />;
			case "notifications": return <NotificationsList />;
			default: return <ConversationsList />;
		}
	}

	return null;
}

const Tab = () => {
	const tabRef = useRef();
	const tabState = useWindows(state => state.mainMenuState.tabState);
	const changeMainMenuTabState = useWindows((state) => state.changeMainMenuTabState);

	const toggleTabClass = () => {
		if(tabState.show) {
			tabRef.current.classList.add("main-menu-tab-open");
		}

		if(!tabState.show) {
			tabRef.current.classList.remove("main-menu-tab-open");
		}
	}

	const closeTab = useCallback(() => {
		changeMainMenuTabState(false, 'conversation');
	}, [changeMainMenuTabState]);

	useEffect(toggleTabClass, [tabState.show]);

	console.log("Main Menu Tab Rendered!");

	return(
		<div ref={tabRef} className="main-menu-tab">
			<div onClick={closeTab} className="main-menu-item-tab-back">
				<i className="chat-icon-back-arrow" />
			</div>
			{renderTab(tabState)}
		</div>
	)
}

const AssistantMenuOption = () => {
	const toggleMainMenuVisibility = useWindows((state) => state.toggleMainMenuVisibility);
	const createConversationWithBOT = useConversationsStore((state) => state.createConversationWithBOT);

	const CreateConversationCallback = useCallback(async () => {
		createConversationWithBOT();
		toggleMainMenuVisibility();
	}, [toggleMainMenuVisibility, createConversationWithBOT]);
	
	return(
		<div 
			className="chat-menu-item"
			onClick={CreateConversationCallback} 
		>
			Assistant
		</div>
	)
}

const UnreadedMessagesIndicator = () => {
	const unreadedMessagesCount = useConversationsStore((state) => state.unreadedMessagesCount);

	if(!unreadedMessagesCount) {
		return null;
	};

	return(
		<div className="chat-menu-item-um-indicator">
			<div className="chat-menu-item-um-indicator-count">{unreadedMessagesCount > 99 ? "99+" : unreadedMessagesCount}</div>
		</div>
	)
}

const UnreadedNotificationsIndicator = () => {
	const unreadedNotificationsCount = useNotificationsStore((state) => state.unreadedNotificationsCount);

	if(!unreadedNotificationsCount) {
		return null;
	};

	return(
		<div className="chat-menu-item-um-indicator">
			<div className="chat-menu-item-um-indicator-count">{unreadedNotificationsCount > 99 ? "99+" : unreadedNotificationsCount}</div>
		</div>
	)
}

const ConversationsButton = () => {
	const changeMainMenuTabState = useWindows((state) => state.changeMainMenuTabState);

	const showConversations = useCallback(() => {
		changeMainMenuTabState(true, 'conversationsList');
	}, [changeMainMenuTabState]);

	return(
		<div onClick={showConversations} className="chat-menu-item">
			Conversations
			<UnreadedMessagesIndicator />
		</div>
	);
};

const NotificationsButton = () => {
	const changeMainMenuTabState = useWindows((state) => state.changeMainMenuTabState);

	const showConversations = useCallback(() => {
		changeMainMenuTabState(true, 'notifications');
	}, [changeMainMenuTabState]);

	return(
		<div onClick={showConversations} className="chat-menu-item">
			Notifications
			<UnreadedNotificationsIndicator />
		</div>
	);
}

const MenuItems = () => {
	const showChatBOTSettings = useWindows((state) => state.showChatBOTSettings);
	const changeMainMenuTabState = useWindows((state) => state.changeMainMenuTabState);

	const showStaffList = useCallback(() => {
		changeMainMenuTabState(true, 'staffList');
	}, [changeMainMenuTabState]);

	const showUsersList = useCallback(() => {
		changeMainMenuTabState(true, 'usersList');
	}, [changeMainMenuTabState]);

	console.log("Main Menu Items Rendered!");

	return(
		<div className="main-menu-buffer">
			<Tab />
			<AssistantMenuOption />
			<NotificationsButton />
			<ConversationsButton />
			<div onClick={showStaffList} className="chat-menu-item">Staff</div>
			<div onClick={showUsersList} className="chat-menu-item">Users</div>
			<div onClick={showChatBOTSettings} className="chat-menu-item">BOT Settings</div>
		</div>
	)
}

const MainMenu = () => {
	const mainMenuRef = useRef();
	const canShowMainMenu = useWindows(state => state.mainMenuState.show);

	const toggleMainMenuClass = () => {
		const mainMenuElement = mainMenuRef.current;
		if(canShowMainMenu) {
			mainMenuElement.classList.add("main-menu-open");
		}

		if(!canShowMainMenu) {
			mainMenuElement.classList.remove("main-menu-open");
		}
	}

	useEffect(toggleMainMenuClass, [canShowMainMenu]);

	console.log("Main Menu Rendered!")

	return(
		<div ref={mainMenuRef} className="main-menu">
			<MenuItems />
		</div>
	)
}

export default MainMenu;