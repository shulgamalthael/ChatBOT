/* @react */
import { memo, useState } from "react";

/* @stylesheet */
import "./header.css";

/* @components */
import CompanionName from "./CompanionName";
import CompanionAvatar from "../../common/CompanionAvatar";

/* @stores */
import { useUserStore } from "../../../stores/user/user";
import { useWindows } from "../../../stores/windows/windows";
import { useConversationsStore } from "../../../stores/conversations/conversations";
import { useNotificationsStore } from "../../../stores/notifications/notificationsStore";
import Switch from "../../common/Switch";
import WLSpinner from "../../common/wlSpinner/WLSpinner";

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

	const role = userData?.role;

	const baseIndicatorClassName = "header-menu-indicator";
	const indicatorClassName = role === "user" || role === "guest"
		? 	`${baseIndicatorClassName} hidden`
		: 	baseIndicatorClassName
	;

	console.log("Header Menu Icon Rendered!");

	const iconClass = canShowMainMenu ? "chat-icon-close relative" : "chat-icon-burger relative";

	return(
		<div onClick={toggleMainMenuVisibility} className={indicatorClassName}>
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

const RoleSwitch = () => {
	const userData = useUserStore((state) => state.userData);
	const changeUserRole = useUserStore((state) => state.changeUserRole);
	const isUserDataFetching = useUserStore((state) => state.isUserDataFetching);

	const changeIsStaffCallback = (value) => {
		changeUserRole(value ? "staff" : "guest");
	}

	return(
		<div className="flex m-auto border-secondary br-15 p-2d5">
			{isUserDataFetching
				?	<WLSpinner />
				:	<Switch 
						onIndicator="Staff" 
						offIndicator="Guest"
						onChange={changeIsStaffCallback}
						value={userData?.role === "staff"}
					/>
			}
		</div>
	)
}

const Header = () => {
	console.log("Header Rendered!");

	return (
		<div className="header">
			<HeaderMenuIcon />
			<RoleSwitch />
			<HeaderCompanionBlock />
		</div>
	)
};

export default Header;