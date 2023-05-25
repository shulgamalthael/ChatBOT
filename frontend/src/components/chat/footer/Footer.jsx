/* @react */
import React, { useCallback, useState } from "react";

/* @stores */
import { useUserStore } from "../../../stores/user/user";
import useSocketStore from "../../../stores/socket/socket";
import { useSettingsStore } from "../../../stores/settings/settings";
import { useConversationsStore } from "../../../stores/conversations/conversations";

/* @components */
import Slider from "../../common/Slider/Slider";

/* @stylesheet */
import "./footer.css";

const SoundSlider = () => {
	console.log("Sound Slider Rendered!");

	const clickCallback = useCallback((e) => {
		e?.preventDefault();
		e?.stopPropagation();
	}, []);

	return(
		<div onClick={clickCallback} className="chat-icon-sound-item">
			<div className="chat-icon-sound-item-slider">
				<Slider />
			</div>
		</div>
	)
}

const VolumeBlock = () => {
	const volume = useSettingsStore((state) => state.volume);
	const toggleVolume = useSettingsStore((state) => state.toggleVolume);

	const volumeClickCllback = useCallback((e) => {
		e?.stopPropagation();
		e?.preventDefault();
		toggleVolume();
	}, [toggleVolume]);

	const iconClass = volume === 0 ? "chat-icon-mutesound" : "chat-icon-sound";

	return(
		<i onClick={volumeClickCllback} className={iconClass}>
			<SoundSlider />
		</i>
	)
}

const PowerBlock = () => {
	const socket = useSocketStore((state) => state.socket);
	const userData = useUserStore((state) => state.userData);
	const stopBOTConversation = useConversationsStore((state) => state.stopBOTConversation);
	const startBOTConversation = useConversationsStore((state) => state.startBOTConversation);
	const selectedConversation = useConversationsStore((state) => state.selectedConversation);
	const isStopped = useConversationsStore((state) => state.botConversationSettings.isStopped);
	const iconClass = isStopped ? "chat-icon-dropdown rotate-270" : "chat-icon-power";

	const clickCallback = useCallback((e) => {
		e?.preventDefault();
		e?.stopPropagation();
		
		return isStopped && selectedConversation ? startBOTConversation() : stopBOTConversation();
	}, [isStopped, selectedConversation]);

	if(!selectedConversation || !userData || !userData?.businessId || !selectedConversation?.recipients?.includes(userData?.businessId)) {
		return null;
	}

	return(
		<i onClick={clickCallback} className={iconClass} />
	)
}

const FooterSettings = () => {
	return(
		<div className="footer-settings">
			<VolumeBlock />
			<PowerBlock />
		</div>
	)
}

const FooterSettingsBlock = () => {
	const [canShowSettings, showSettings] = useState(false);

	const toggleSettingsStateCallback = useCallback(() => {
		showSettings(prev => !prev);
	}, [showSettings]);

	console.log("Footer Settings Block Rendered!");

	return(
		<i onClick={toggleSettingsStateCallback} className="chat-icon-settings footer-icon footer-settings-icon">
			{canShowSettings && <FooterSettings />}
		</i>
	)
}

const MessageInput = () => {
	const socket = useSocketStore((state) => state.socket);
	const userData = useUserStore((state) => state.userData);
	const selectedConversation = useConversationsStore((state) => state.selectedConversation);
	const generateOutputMessage = useConversationsStore((state) => state.generateOutputMessage);
	const isStopped = useConversationsStore((state) => state.botConversationSettings.isStopped);
	const isConversationWaitingStuff = useConversationsStore((state) => state.isConversationWaitingStuff);

	console.log("MessageInput Rendered!");

	const isBotConversation = selectedConversation?.recipients?.includes(userData?.businessId);

	const sendMessageCallback = useCallback((e) => {
		if(socket && socket.connected && e.keyCode === 13 && e.target.value) {
			const newMessage = generateOutputMessage(e.target.value);

			if(newMessage) {
				socket.emit('conversation/message', newMessage);
				e.target.value = "";
			}
		}
	}, [socket, generateOutputMessage]);

	
	if(!selectedConversation || (isStopped && isBotConversation) || isConversationWaitingStuff) {
		return null;
	}

	return(
		<input
			className="messageInput" 
			placeholder="Enter message..."
			onKeyDown={sendMessageCallback} 
		/>
	)
}

const FooterItems = () => {
	return(
		<React.Fragment>
			<div className="flex flex-grow">
				<MessageInput />
			</div>
			<FooterSettingsBlock />
		</React.Fragment>
	)
}

const Footer = () => {
	const selectedConversation = useConversationsStore(state => state.selectedConversation);

	console.log("Footer Rendered!");

	return (
		<div className="footer">
			{selectedConversation && <FooterItems />}
		</div>
	)
};

export default Footer;