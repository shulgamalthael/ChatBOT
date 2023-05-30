/* components */
import Message from "./Message";

/* scripts */
import { useCallback, useEffect, useLayoutEffect, useRef } from "react";
import { useUserStore } from "../../../stores/user/user";
import WLSpinner from "../../common/wlSpinner/WLSpinner";
import { useConversationsStore } from "../../../stores/conversations/conversations";
import { useBotSettings } from "../../../stores/botSettings/botSettingsStore";

const splitByDateMessagesList = (messagesList) => {
	return messagesList.reduce((acc, message) => {
		const dateString = /^\d{4}-\d{2}-\d{2}/.exec(message.sendedAt)[0];

		if(!acc[dateString]) {
			acc[dateString] = [];
		}

		if(acc[dateString]) {
			acc[dateString].push(message);
		}

		return acc;
	}, {});
}

const sortMessagesByDate = (_a, _b) => new Date(_a.sendedAt).getTime() - new Date(_b.sendedAt).getTime();

const sortMessagesBlockByDate = (a, b) => {
	if(!a?.length || !b?.length) {
		return 0;
	}

	if(a.length > 1) {
		a.sort(sortMessagesByDate);
	}
	
	if(b.length > 1) {
		b.sort(sortMessagesByDate);
	}

	return new Date(a[0].sendedAt).getTime() - new Date(b[0].sendedAt).getTime();
};

const processMessagesAndSortItByDate = (sortedByDateMessagesLists) => {
	const messages = Object.values(sortedByDateMessagesLists);

	if(!messages.length) {
		return [];
	}

	if(messages.length > 1) {
		messages.sort(sortMessagesBlockByDate);
		return messages;
	}

	messages[0].sort(sortMessagesByDate);

	return messages;
}

const renderMessageBlock = (messagesList) => {
	return(
		<MessageBlock
			messagesList={messagesList}
			key={messagesList[0].sendedAt}
		/>
	)
}
const getBlockDate = (dateISO) => {
	const dateRegex = /^\d{4}-\d{2}-\d{2}/;
	const executedCurrentDateArray = dateRegex.exec(new Date().toISOString());
	const executedDateArray = dateRegex.exec(dateISO) || executedCurrentDateArray;
	const [processableDateString] = executedDateArray;

	if(processableDateString === executedCurrentDateArray[0]) {
		return "Today"
	}

	return processableDateString;
}

const MessagesPaginationSpinner = () => {
	const isMessagesListFetching = useConversationsStore((state) => state.isMessagesListFetching);

	return isMessagesListFetching && <WLSpinner />;
}

const MessageBlock = ({ messagesList }) => {
	const userData = useUserStore(state => state.userData);
	const blockDate = getBlockDate(messagesList[0].sendedAt);

	return(
		<div className="messages-block">
			<div className="messages-block-date">
				{blockDate}
			</div>
			{messagesList.map((message, messageIndex, _messagesList) => {
				return(
					<Message
						message={message}
						key={message._id}
						canShowMenuDescription={_messagesList[messageIndex - 1] && 
							!_messagesList[messageIndex - 1].isCommandMenuOption &&
							_messagesList[messageIndex].isCommandMenuOption
						}
						isUser={message.sender._id === userData?._id}
						isLast={messageIndex === _messagesList.length - 1}
						hasName={message.sender._id !== _messagesList[messageIndex - 1]?.sender._id}
					/>
				)
			})}
		</div>
	)
}

const MessagesPagination = ({ messagesBlockRef }) => {
	const isSubbed = useRef(false);
	const selectedConversation = useConversationsStore((state) => state.selectedConversation);
	const getMessagesPaginationPage = useConversationsStore((state) => state.getMessagesPaginationPage);
	const isConversationWaitingStaff = useConversationsStore((state) => state.isConversationWaitingStaff);
	const messages = selectedConversation?.messages || [];

	const scrollHandlerCallback = useCallback(async (e) => {
		if(e.target.scrollTop === 0) {
			const isFetched = await getMessagesPaginationPage();
			if(isFetched) {
				e.target.scrollTop = 250;
			}
		}
	}, [getMessagesPaginationPage]);

	useEffect(() => {
		if(isConversationWaitingStaff && messagesBlockRef.current) {
			messagesBlockRef.current.scrollTop = messagesBlockRef.current?.scrollHeight || 0;
		}
	}, [isConversationWaitingStaff]);
	
	useEffect(() => {
		const _isSubbed = isSubbed.current;
		const messageBlockElement = messagesBlockRef.current;

		if(messageBlockElement && !messages.length && !_isSubbed) {
			isSubbed.current = true;
			messageBlockElement.removeEventListener("scroll", scrollHandlerCallback);
		}

		if(messageBlockElement && !!messages.length) {
			isSubbed.current = false;
			messageBlockElement.addEventListener("scroll", scrollHandlerCallback);
		}
		

		return () => {
			if(messageBlockElement) {
				messageBlockElement.removeEventListener("scroll", scrollHandlerCallback);
			}
		}
	}, [messages, isSubbed, messagesBlockRef, scrollHandlerCallback]);

	return <MessagesPaginationSpinner />;
}

const LiveAgentWaitingDescription = () => {
	const responseDuration = useBotSettings((state) => state.liveAgentSettings.responseDuration);
	const isConversationWaitingStaff = useConversationsStore((state) => state.isConversationWaitingStaff);

	if(!isConversationWaitingStaff) {
		return null;
	}

	return(
		<div className="flex flex-col mv-15">
			<div className="m-auto color-primary fw-700">
				<div>We are searhing a staff for You</div>
				<div>Please wait</div>
				<div>Acceptable waiting time {responseDuration} mins.</div>
			</div>
			<WLSpinner />
			<div></div>
		</div>
	);
};

const MessagesList = () => {
	const messagesBlockRef = useRef(null);
	const messages = useConversationsStore(state => state.selectedConversation?.messages);

	if(!Array.isArray(messages)) {
		return null;
	}

	console.log("Messages List Rendered!", messages);

	return (
		<div ref={messagesBlockRef} className="messages">
			<MessagesPagination messagesBlockRef={messagesBlockRef} />
			{processMessagesAndSortItByDate(splitByDateMessagesList(messages)).map(renderMessageBlock)}
			<LiveAgentWaitingDescription />
		</div>
	)
};

export default MessagesList;