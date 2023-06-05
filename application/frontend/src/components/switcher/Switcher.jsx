/* @react */
import React, { useCallback, useEffect, useRef } from "react";

/* @stylesheet */
import "./switcher.css"

/* @components */
import BOTAvatar from "../common/BOTAvatar";
import NetworkIndicator from "../common/NetworkIndicator";

/* @stores */
import { useSettingsStore } from "../../stores/settings/settings";
import { useConversationsStore } from "../../stores/conversations/conversations";

export const UnreadedMessagesIndicator = () => {
	const unreadedMessagesCount = useConversationsStore((state) => state.unreadedMessagesCount);

	if(!unreadedMessagesCount || unreadedMessagesCount <= 0) {
		return null;
	}

	return(
		<div style={{ position: "absolute", height: "100%", width: "100%", borderRadius: "50%", border: "1px solid red" }}>
			<div style={{ position: "absolute", bottom: 0, left: 0, display: "flex", height: "20px", width: "20px", backgroundColor: "red", borderRadius: "50%", color: "var(--secondary-color)", fontWeight: "700" }}>
				<div style={{ margin: "auto", fontSize: "10px" }}>
					{unreadedMessagesCount > 98 ? 99 : unreadedMessagesCount}
				</div>
			</div>
		</div>
	)
}

const DisabledStateContent = () => {
	return(
		<React.Fragment>
			<BOTAvatar />
			<NetworkIndicator isOnline />
			<UnreadedMessagesIndicator />
		</React.Fragment>
	)
}

const SwitcherWrapper = () => {
	const switcherRef = useRef();
	const isChatOpened = useSettingsStore(state => state.isChatOpened);
	const soundUIClick = useSettingsStore((state) => state.soundUIClick);
	const toggleChatDisplayState = useSettingsStore(state => state.toggleChatDisplayState);

	const toggleChatDisplayStateCallback = useCallback(() => {
		toggleChatDisplayState();
		soundUIClick();
	}, []);

	const toggleSwitcherClasses = useCallback(() => {
		soundUIClick();
		if (!isChatOpened) {
			switcherRef.current.classList.remove("wl-cb-switcher-true");
			switcherRef.current.classList.add("wl-cb-switcher-false");
		}

		if (isChatOpened) {
			switcherRef.current.classList.remove("wl-cb-switcher-false");
			switcherRef.current.classList.add("wl-cb-switcher-true");
		}
	}, [isChatOpened]);

	useEffect(() => {
		toggleSwitcherClasses();
	}, [toggleSwitcherClasses]);

	console.log("Switcher Wrapper Rendered!");

	return(
		<div
			ref={switcherRef} 
			className="wl-cb-switcher"
			onClick={toggleChatDisplayStateCallback}
		>
			{isChatOpened && <i className="chat-icon-dropdownbold chat-icon flex flex-col flex-center h-full w-full color-secondary" />}
			{!isChatOpened && <DisabledStateContent />}
		</div>
	)
}

const Switcher = () => {
	console.log("Switcher Rendered!");

	return(
		<SwitcherWrapper />
	)
}

export default Switcher;