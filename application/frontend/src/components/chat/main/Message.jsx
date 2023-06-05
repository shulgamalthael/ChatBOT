/* react */
import React, { memo, useCallback, useEffect, useRef } from "react";

/* scripts */
import useSocketStore from "../../../stores/socket/socket";
import { useConversationsStore } from "../../../stores/conversations/conversations";

const MessageDate = memo(({ date, hidden }) => {
	console.log("Date Rendered!");

	const regex = /^\d{4}-\d{2}-\d{2}T(\d{2}:\d{2}):\d{2}\..*/;

	const uiDate = regex.exec(date)[1];
	
	const baseClassName = "message-date";
	const className = hidden ? `${baseClassName} hidden float-right` : `${baseClassName} absolute`;

	return <div className={className}>{uiDate}</div>
});

const MessageText = memo(({ text }) => {
	console.log("Text Rendered!");

	return(
		<div className="message-text">
			{text}
		</div>
	)
});

const Name = memo(({ name }) => {
	console.log("Name Rendered!");

	return(
		<div className="message-nameBlock">
			<div className="message-name">{name}</div>
		</div>
	);
});

const Message = memo(({ message, canShowMenuDescription, hasName, isUser, isLast }) => {
	const messageRef = useRef();
	const scrollIntoView = useConversationsStore((state) => state.scrollIntoView);
	const sendMessageToServer = useConversationsStore((state) => state.sendMessageToServer);

	const baseMessageClassName = "message-visible";
	const messageClassByUserType = isUser ? "message-user" : "message-companion";
	let messageClassName = `${baseMessageClassName} ${messageClassByUserType}`;
	messageClassName = isLast 
		? `${messageClassName} ${messageClassByUserType}-last` 
		: messageClassName
	;

	messageClassName = message.isCommandMenuOption 
		? `${messageClassName} opacity-50 opacity-1-hover` 
		: messageClassName
	;

	const baseMessagePositionerClassName = "message-positioner";
	const messagePositionerClassName = isUser ? `${baseMessagePositionerClassName} message-positioner-user` : `${baseMessagePositionerClassName} message-positioner-companion`;

	console.log(`Message ${message._id} Rendered!`);

	const clickCallback = useCallback((e) => {
		e?.stopPropagation();

		sendMessageToServer(message);
	}, [message, sendMessageToServer]);

	useEffect(() => {
		isLast && scrollIntoView(messageRef.current);
	}, [isLast]);

	const messageTag = message.link ? 'a' : 'div';
	let messageProps = {};
	
	if(message.link) {
		messageProps.href = message.link;
		messageProps.target = '_blank';
	}

	return(
		<div ref={messageRef} className="message">
			<div className={messagePositionerClassName}>
				{hasName && <Name name={message.sender.username} />}
				{canShowMenuDescription && <div className="color-primary">Choose: </div>}
				<div className={messageClassName} onClick={clickCallback}>
					{React.createElement(messageTag, messageProps, 
						<React.Fragment>
							<MessageText text={message.text} date={message.sendedAt} />
							{!message.isCommandMenuOption && (
								<React.Fragment>
									<MessageDate date={message.sendedAt} />
									<MessageDate hidden date={message.sendedAt} />
								</React.Fragment>
							)}
						</React.Fragment>
					)}
				</div>
			</div>
		</div>
	)
});

export default Message;
