/* @react */
import React from "react";

/* @stores */
import { useConversationsStore } from "../../../stores/conversations/conversations";

/* @components */
import MainMenu from "./MainMenu";
import MessagesList from "./MessagesList";
import ChatBotOverlay from "./ChatBotOverlay";
import WLSpinner from "../../common/wlSpinner/WLSpinner";

const Conversation = () => {
	const selectedConversation = useConversationsStore((state) => state.selectedConversation);
	const isConversationFetching = useConversationsStore((state) => state.isConversationFetching);

	if(isConversationFetching) {
		return(
			<div className="flex h-full w-full">
				<WLSpinner />
			</div>
		)
	}

	if(!selectedConversation) {
		return null;
	}

	return(
		<React.Fragment>
			<MessagesList />
		</React.Fragment>
	);
}

const Main = () => {
	console.log("Main Rendered!");

	return (
		<div className="main">
			<MainMenu />
			<Conversation />
			<ChatBotOverlay />
		</div>
	)
};

export default Main;