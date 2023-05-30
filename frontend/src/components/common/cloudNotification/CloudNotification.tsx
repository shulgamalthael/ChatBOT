/* @react */
import React, { FC, MouseEvent, useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";

/* @stores */
import { useConversationsStore } from "../../../stores/conversations/conversations";

/* @styles */
import Avatar from "../Avatar";
import "../cloudMessage/CloudMessage.css";
import { useWindows } from "../../../stores/windows/windows";
import { useSettingsStore } from "../../../stores/settings/settings";
import { INotification } from "../../../stores/notifications/notificationsStore";
import SaveButton from "../SaveButton";
import CancelButton from "../CancelButton";

interface IMessageCloudProps {
    index: number;
    notification: INotification;
}

const CloudNotification: FC<IMessageCloudProps> = ({ notification, index }) => {
    const [width, setWidth] = useState(0);
    const timeout = useRef<NodeJS.Timeout | undefined>(undefined);
    
    const messageRef = useRef<HTMLDivElement>(null);
    const avatarUrl = "";
    const offset = `calc(${(index * width) + (index * 5)}px)`;
    
    const openChat = useSettingsStore((state) => state.openChat);
	const hideMainMenu = useWindows((state) => state.hideMainMenu);
    const closeMessage = useConversationsStore((state) => state.messagesCloudState.closeMessage);
    const closeAllSimilarCloudMessages = useConversationsStore((state) => state.closeAllSimilarCloudMessages);
    const queryConversationByIdAndSelectIt = useConversationsStore((state) => state.queryConversationByIdAndSelectIt);
    
    const messageClickHandler = useCallback(async () => {
        await queryConversationByIdAndSelectIt(notification.conversationId);
        closeAllSimilarCloudMessages(index);
        hideMainMenu();
        openChat();
    }, [index, notification, closeMessage, queryConversationByIdAndSelectIt]);

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
                    <div className="wl-cb-messageCloudName">{notification.to}</div>
                </div>
                <div className="wl-cb-messageCloudText mv-5">{notification.title}</div>
                <div className="flex flex-btw">
                    <SaveButton>Accept</SaveButton>
                    <CancelButton skipMarginBottom>Decline</CancelButton>
                </div>
            </div>
        </React.Fragment>
    );
}

export default CloudNotification;