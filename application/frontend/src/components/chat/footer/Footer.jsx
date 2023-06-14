/* @react */
import React, { useCallback, useState, MouseEvent } from "react";

/* @stores */
import { useUserStore } from "../../../stores/user/user";
import useSocketStore from "../../../stores/socket/socket";
import { useSettingsStore } from "../../../stores/settings/settings";
import { useConversationsStore } from "../../../stores/conversations/conversations";

/* @components */
import Slider from "../../common/Slider/Slider";

/* @stylesheet */
import "./footer.css";
import SaveButton from "../../common/SaveButton";
import WLSpinner from "../../common/wlSpinner/WLSpinner";

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
	const userData = useUserStore((state) => state.userData);
	// const stopBOTConversation = useConversationsStore((state) => state.stopBOTConversation);
	const startBOTConversation = useConversationsStore((state) => state.startBOTConversation);
	const selectedConversation = useConversationsStore((state) => state.selectedConversation);
	const isStopped = useConversationsStore((state) => state.botConversationSettings.isStopped);
	const isConversationSupportedByStaff = useConversationsStore((state) => state.isConversationSupportedByStaff);
	const endConversationSupportingByStaff = useConversationsStore((state) => state.endConversationSupportingByStaff);
	const isConversationSupportingDataFetching = useConversationsStore((state) => state.isConversationSupportingDataFetching);

	const iconClass = isStopped ? "chat-icon-dropdown rotate-270" : "chat-icon-power";

	const isUserAreStaff = userData?.role === "staff";
	const isUserConversationOwner = selectedConversation?.creator === userData?._id;
	const isUserAreConversationCreator = userData?._id === selectedConversation?.creator;
	const isBotConversation = selectedConversation?.recipients?.includes(userData?.businessId);

	const clickCallback = (e) => {
		e?.preventDefault();
		e?.stopPropagation();

		if(isConversationSupportedByStaff && isUserAreStaff && !isUserConversationOwner) {
			return endConversationSupportingByStaff();
		}

		// return isStopped && selectedConversation ? startBOTConversation() : stopBOTConversation();
		return startBOTConversation()
	};

	if(!selectedConversation || !userData || !userData?.businessId || !isBotConversation) {
		return null;
	}

	if(isBotConversation && !isConversationSupportedByStaff && isUserAreStaff && !isUserAreConversationCreator) {
		return null;
	}

	if(isBotConversation && isConversationSupportedByStaff && isConversationSupportingDataFetching) {
		return <WLSpinner className="scale-50" />
	}

	return(
		<i onClick={clickCallback} className={iconClass} />
	)
}

const CloseButton = () => {
	const hideChat = useSettingsStore((state) => state.hideChat);

	const hideChatCallback = useCallback((e) => {
		e?.preventDefault();
		e?.stopPropagation();
		hideChat();
	}, [hideChat]);

	return(
		<div onClick={hideChatCallback} className="wl-cb-mobile-only">
			<i className="chat-icon-close" />
		</div>
	);
}

const FooterSettings = () => {
	return(
		<div className="footer-settings">
			<VolumeBlock />
			<PowerBlock />
			<CloseButton />
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
	const processSocketConnection = useSocketStore((state) => state.processSocketConnection);
	const isConversationLocked = useConversationsStore((state) => state.isConversationLocked);
	const selectedConversation = useConversationsStore((state) => state.selectedConversation);
	const generateOutputMessage = useConversationsStore((state) => state.generateOutputMessage);
	const isStopped = useConversationsStore((state) => state.botConversationSettings.isStopped);
	const isConversationWaitingStaff = useConversationsStore((state) => state.isConversationWaitingStaff);
	const isLastMessageBeingUserForm = useConversationsStore((state) => state.isLastMessageBeingUserForm);
	const isConversationLockedForStaff = useConversationsStore((state) => state.isConversationLockedForStaff);
	const startConversationSupportingByStaff = useConversationsStore((state) => state.startConversationSupportingByStaff);
	const isConversationSupportingDataFetching = useConversationsStore((state) => state.isConversationSupportingDataFetching);

	console.log("MessageInput Rendered!");

	const isBotConversation = selectedConversation?.recipients?.includes(userData?.businessId);

	const sendMessageCallback = useCallback((e) => {
		
		if(!socket || !socket.connected) {
			processSocketConnection();
		}
		
		if(socket && socket.connected && e.keyCode === 13 && e.target.value) {
			const newMessage = generateOutputMessage(e.target.value);

			if(newMessage) {
				socket.emit('conversation/message', newMessage);
				e.target.value = "";
			}
		}
	}, [socket, generateOutputMessage]);

	const isUserCreatedConversation = userData?._id === selectedConversation?.creator;
	
	if(isConversationLockedForStaff) {
		return(
			<SaveButton 
				className="m-auto flex"
				click={startConversationSupportingByStaff} 
				isLoading={isConversationSupportingDataFetching} 
			>
				Start Conversation
			</SaveButton>
		)
	}

	if(isConversationLocked || isLastMessageBeingUserForm || (isStopped && isBotConversation && !isUserCreatedConversation) || isConversationWaitingStaff) {
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