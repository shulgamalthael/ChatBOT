/* @react */
import React, { FC, MouseEvent, useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";

/* @stores */
import { ICloudMessage, useConversationsStore } from "../../../stores/conversations/conversations";

/* @styles */
import "./CloudMessage.css";
import { useSettingsStore } from "../../../stores/settings/settings";
import Avatar from "../Avatar";
import { useWindows } from "../../../stores/windows/windows";

interface IMessageCloudProps {
    index: number;
    message: ICloudMessage;
}

const MessageCloud: FC<IMessageCloudProps> = ({ message, index }) => {
    const [width, setWidth] = useState(0);
    const timeout = useRef<NodeJS.Timeout | undefined>(undefined);
    
    const messageRef = useRef<HTMLDivElement>(null);
    const avatarUrl = message.recipientData.avatarUrl;
    const offset = `calc(${(index * width) + (index * 5)}px)`;
    
    const openChat = useSettingsStore((state) => state.openChat);
	const hideMainMenu = useWindows((state) => state.hideMainMenu);
    const closeMessage = useConversationsStore((state) => state.messagesCloudState.closeMessage);
    const closeAllSimilarCloudMessages = useConversationsStore((state) => state.closeAllSimilarCloudMessages);
    const queryConversationByIdAndSelectIt = useConversationsStore((state) => state.queryConversationByIdAndSelectIt);
    
    const messageClickHandler = useCallback(async () => {
        await queryConversationByIdAndSelectIt(message.conversationId);
        closeAllSimilarCloudMessages(index);
        hideMainMenu();
        openChat();
    }, [index, message, closeMessage, queryConversationByIdAndSelectIt]);

    const close = useCallback((e: MouseEvent<HTMLElement>) => {
        e?.stopPropagation();
        e?.preventDefault();
        closeMessage(index);
    }, [index, closeMessage]);

    const endTimeout = useCallback(() => {
        clearTimeout(timeout.current);
    }, [timeout]);

    const startTimeout = useCallback(() => {
        clearTimeout(timeout.current);
        timeout.current = setTimeout(() => {
            closeMessage(index);
        }, 5000);
    }, [timeout, close]);

    useEffect(() => {
        startTimeout();
    },[index, startTimeout]);

    useLayoutEffect(() => {
        if(messageRef.current) {
            setWidth(messageRef.current.clientWidth);
        }
    }, [offset, messageRef]);

    return(
        <React.Fragment>
            <div
                ref={messageRef} 
                style={{ right: offset }}
                onMouseEnter={endTimeout} 
                onMouseLeave={startTimeout}
                onClick={messageClickHandler} 
                className="wl-cb-messageCloud" 
            >
                <div className="wl-cb-messageCloudCloseBlock">
                    <i onClick={close} className="chat-icon-close" />
                </div>
                <div className="wl-cb-messageCloudAvatarContainer">
                    <div className="h-25 w-25 m-5">
                        <Avatar avatarUrl={avatarUrl} isOnline />
                    </div>
                    <div className="wl-cb-messageCloudName">{message.recipientData.username}</div>
                </div>
                <div className="wl-cb-messageCloudText mv-5">{message.text}</div>
            </div>
        </React.Fragment>
    );
}

export default MessageCloud;