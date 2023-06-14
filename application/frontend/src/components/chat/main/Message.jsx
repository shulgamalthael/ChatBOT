/* react */
import React, { memo, useCallback, useState, useEffect, useRef } from "react";

/* scripts */
import Input from "../../common/Input";
import Label from "../../settings/Label";
import CancelButton from "../../common/CancelButton";
import WLSpinner from "../../common/wlSpinner/WLSpinner";
import { useUserStore } from "../../../stores/user/user";
import { useBotSettings } from "../../../stores/botSettings/botSettingsStore";
import { useConversationsStore } from "../../../stores/conversations/conversations";

const TwillioMailer = ({ close }) => {
	const [mailerState, changeMailerState] = useState({ number: '+', message: '' });
	const sendTwillioMessage = useBotSettings((state) => state.sendTwillioMessage);
	const [isTwillioMessageFetching, setIsTwillioMessageFetching] = useState(false);

	const sendTwillioMessageCallback = useCallback(async (e) => {
		e?.preventDefault();
		e?.stopPropagation();
		setIsTwillioMessageFetching(true);

		const isSended = await sendTwillioMessage(mailerState);

		if(isSended) {
			close();
		}

		setIsTwillioMessageFetching(false);
	}, [mailerState, sendTwillioMessage]);

	const changeMailerStateNumber = useCallback((e) => {
		e?.preventDefault();
		e?.stopPropagation();

		if(/^(\+?|\d)\d*(\+?|\d)$/.test(e.target.value)) {
			changeMailerState(prev => ({
				...prev,
				number: e.target.value.includes('+')
					? 	e.target.value
					: 	`+${e.target.value}`
				,
			}));
		}
	}, [changeMailerState]);

	const changeMailerStateMessage = useCallback((e) => {
		e?.preventDefault();
		e?.stopPropagation();

		changeMailerState(prev => ({
			...prev,
			message: e.target.value,
		}));
	}, [changeMailerState]);

	return(
		<div className="flex flex-col bg-primary br-5 p-5 w-half mb-5">
			<Label color="secondary" title="Twillio Number">
				<Input inputValue={mailerState.number} onChange={changeMailerStateNumber} />
			</Label>
			<Label color="secondary" title="Message">
				<textarea className="option-input flex w-full" value={mailerState.message} onChange={changeMailerStateMessage} />
			</Label>
			<CancelButton disabled={isTwillioMessageFetching} click={sendTwillioMessageCallback}>
				<div className="flex flex-col flex-center">
					<div className="flex">
						<span className="m-auto">Send</span>
						{isTwillioMessageFetching && <WLSpinner className="scale-50" />}
					</div>
				</div>
			</CancelButton>
			<CancelButton click={close} skipMarginBottom>Close</CancelButton>
		</div>
	)
}

const UserForm = () => {
	const [email, setEmail] = useState('');
	const [username, setUserName] = useState('');
	const sendUserData = useUserStore((state) => state.sendUserData);
	const isUserDataFetching = useUserStore((state) => state.isUserDataFetching);

	const setEmailCallback = useCallback((e) => {
		setEmail(e.target.value);
	}, [setEmail]);

	const setUserNameCallback = useCallback((e) => {
		setUserName(e.target.value);
	}, [setUserName]);

	const sendUserDataCallback = useCallback((e) => {
		e?.preventDefault();
		e?.stopPropagation();

		sendUserData({ email, username });
	}, [email, username, sendUserData]);

	return(
		<div className="w-200">
			<Label title="Enter your name:">
				<Input inputValue={username} onChange={setUserNameCallback} />
			</Label>
			<Label title="Enter your email:">
				<Input inputValue={email} onChange={setEmailCallback} />
			</Label>
			<CancelButton click={sendUserDataCallback}>
				<div className="flex">
					<div className="m-auto">Send</div>
					{isUserDataFetching && <WLSpinner className="h-10 w-10 ml-5" />}
				</div>
			</CancelButton>
		</div>
	)
}

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
		<div className="message-text" dangerouslySetInnerHTML={{ __html: text }}></div>
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

	const userData = useUserStore((state) => state.userData);
	const twillioSettings = useBotSettings((state) => state.twillioSettings);
	const selectedConversation = useConversationsStore((state) => state.selectedConversation);

	const [canShowTwillioMailer, showTwillioMailer] = useState(false);

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

		if(message?.actionType === "twillioMessangerTrigger") {
			return showTwillioMailer(true);
		}

		sendMessageToServer(message);
	}, [message, sendMessageToServer]);

	const closeTwillioMailerCallback = useCallback(() => {
		showTwillioMailer(false);
	}, [showTwillioMailer]);

	useEffect(() => {
		isLast && scrollIntoView(messageRef.current);
	}, [isLast]);

	const messageTag = message.link ? 'a' : 'div';
	let messageProps = {};
	
	const parseMessage = (text) => {
		let result = text;
		let linksExecutedArray = [];
		if(/(https?:\/\/|www\.|\/)\S+[\w]/g.test(text)) {
			linksExecutedArray = text.match(/(https?:\/\/|www\.|\/)\S+[\w]/g) || linksExecutedArray;
		}

		result = linksExecutedArray.reduce((acc, link) => {
			const trueLink = /^www\./.test(link)
				? 	`http://${link}`
				: 	link
			;

			acc = acc.replace(link, `<a href="${trueLink}" target="_blank">${link}</a>`);
			
			return acc;
		}, result);

		return result;
	}

	const senderName = userData?._id === message.sender._id
		?	"You"
		:	message.sender.username
	;

	if(canShowTwillioMailer) {
		return <TwillioMailer close={closeTwillioMailerCallback} />;
	}

	if(message?.actionType === 'userForm' && (/guest/i.test(userData?.username) || !userData?.email) && selectedConversation?.creator === userData?._id) {
		return <UserForm />;
	}

	if(message?.actionType === 'userForm' && !/guest/i.test(userData?.username && userData?.email && selectedConversation?.creator !== userData?._id)) {
		return null;
	}

	if(message?.actionType === 'twillioMessangerTrigger' && (!twillioSettings.enabled || !twillioSettings.number || !twillioSettings.accountSid || !twillioSettings.accountAuthToken)) {
		return null;
	}

	return(
		<div ref={messageRef} className="message">
			<div className={messagePositionerClassName}>
				{hasName && <Name name={senderName} />}
				{canShowMenuDescription && <div className="color-primary">Choose: </div>}
				<div className={messageClassName} onClick={clickCallback}>
					{React.createElement(messageTag, messageProps, 
						<React.Fragment>
							<MessageText text={parseMessage(message.text)} date={message.sendedAt} />
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
