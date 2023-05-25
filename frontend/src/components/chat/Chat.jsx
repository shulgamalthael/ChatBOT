/* @components */
import Main from "./main/Main";
import Header from "./header/Header";
import Footer from "./footer/Footer";

/* @stylesheet */
import "./chat.css";
import { useCallback, useEffect, useRef } from "react";

/* @stores */
import { useSettingsStore } from "../../stores/settings/settings";

const ChatBufferDimesion = ({ children }) => {
	const chatRef = useRef();
	const isChatOpened = useSettingsStore(state => state.isChatOpened);

	const toggleChatClasses = useCallback(() => {
		if(!chatRef.current) {
			return;
		}

		if (!isChatOpened) {
			chatRef.current.classList.add("chat-false");
		}

		if (isChatOpened) {
			chatRef.current.classList.remove("chat-false");
		}
	}, [isChatOpened]);

	useEffect(() => {
		toggleChatClasses();
	}, [toggleChatClasses]);

	console.log("Chat Buffer Dimesion Rendered!");

	return(
		<div ref={chatRef} className="chat chat-false">
			<div className="chat-wrapper">
				{children}
			</div>
		</div>
	)
}

const Chat = () => {
	console.log("Chat Rendered!");

  return (
    <ChatBufferDimesion>
		<Header />
		<Main />
		<Footer />
	</ChatBufferDimesion>
  );
}

export default Chat;