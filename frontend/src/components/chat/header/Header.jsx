/* @react */
import React, { memo } from "react";

/* @stylesheet */
import "./header.css";

/* @components */
import CompanionName from "./CompanionName";
import CompanionAvatar from "../../common/CompanionAvatar";

/* @stores */
import { useWindows } from "../../../stores/windows/windows";
import { useConversationsStore } from "../../../stores/conversations/conversations";
import { useNotificationsStore } from "../../../stores/notifications/notificationsStore";
import { useUserStore } from "../../../stores/user/user";

const HeaderCompanionAvatar = memo(() => {
	console.log("Header Companion Avatar Rendered!");
	
	return(
		<div className="headerAvatar">
			<CompanionAvatar />
		</div>
	)
});

const UnreadedMessagesIndicator = () => {
	const unreadedMessagesCount = useConversationsStore((state) => state.unreadedMessagesCount);
	const unreadedNotificationsCount = useNotificationsStore((state) => state.unreadedNotificationsCount);

	const count = unreadedMessagesCount + unreadedNotificationsCount;

	if(!unreadedMessagesCount) {
		return null;
	}

	return(
		<div style={{ position: "absolute", display: "flex", height: "17px", width: "17px", backgroundColor: "red", borderRadius: "50%", bottom: "-10px", left: "-10px" }}>
			<div style={{ fontSize: "10px", margin: "auto" }}>
				{count > 99 ? "99+" : count}
			</div>
		</div>
	)
}

const HeaderMenuIcon = () => {
	const userData = useUserStore((state) => state.userData);
	const canShowMainMenu = useWindows(state => state.mainMenuState.show);
	const toggleMainMenuVisibility = useWindows(state => state.toggleMainMenuVisibility);

	const role = userData.role;

	if(role === "user" || role === "guest") {
		return null;
	}

	console.log("Header Menu Icon Rendered!");

	const iconClass = canShowMainMenu ? "chat-icon-close relative" : "chat-icon-burger relative";

	return(
		<div onClick={toggleMainMenuVisibility} className="header-menu-indicator">
			<i className={iconClass}>
				<UnreadedMessagesIndicator />
			</i>
		</div>
	)
}

const HeaderCompanionBlock = () => {
	const selectedConversation = useConversationsStore(state => state.selectedConversation);

	if(!selectedConversation) { return null; }

	return(
		<div className="header-conversationBlock">
			<CompanionName />
			<HeaderCompanionAvatar />
		</div>
	)
}

const Header = () => {
	console.log("Header Rendered!");

	return (
		<div className="header">
			<HeaderMenuIcon />
			<HeaderCompanionBlock />
		</div>
	)
};

export default Header;