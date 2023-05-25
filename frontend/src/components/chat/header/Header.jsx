/* @react */
import { memo } from "react";

/* @stylesheet */
import "./header.css";

/* @components */
import CompanionName from "./CompanionName";
import CompanionAvatar from "../../common/CompanionAvatar";

/* @stores */
import { useWindows } from "../../../stores/windows/windows";
import { useConversationsStore } from "../../../stores/conversations/conversations";

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

	if(!unreadedMessagesCount) {
		return null;
	}

	return(
		<div style={{ position: "absolute", display: "flex", height: "17px", width: "17px", backgroundColor: "red", borderRadius: "50%", bottom: "-10px", left: "-10px" }}>
			<div style={{ fontSize: "10px", margin: "auto" }}>
				{unreadedMessagesCount > 99 ? "99+" : unreadedMessagesCount}
			</div>
		</div>
	)
}

const HeaderMenuIcon = () => {
	const canShowMainMenu = useWindows(state => state.mainMenuState.show);
	const toggleMainMenuVisibility = useWindows(state => state.toggleMainMenuVisibility);

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