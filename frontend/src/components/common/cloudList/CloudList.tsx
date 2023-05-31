import React, { FC, MouseEvent, useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { useCloudStore } from "../../../stores/cloud/cloud";
import { useSettingsStore } from "../../../stores/settings/settings";
import { useWindows } from "../../../stores/windows/windows";
import { useConversationsStore } from "../../../stores/conversations/conversations";
import { IGenericObjectType } from "../../../interfaces/genericObjectType";
import { getUserDataByIdAPI } from "../../../api/api";
import { IUserData } from "../../../stores/socket/socket";
import Avatar from "../Avatar";
import WLSpinner from "../wlSpinner/WLSpinner";
import "./Cloud.css";

interface ICloudProps {
    index: number;
    cloud: IGenericObjectType;
}

const Cloud: FC<ICloudProps> = ({ cloud, index }) => {
    const [width, setWidth] = useState(0);
    const [cloudOwnerData, setCloudOwnerData] = useState<IUserData | null>(null);
    const timeout = useRef<NodeJS.Timeout | undefined>(undefined);

    const cloudRef = useRef<HTMLDivElement>(null);

    const avatarUrl = cloudOwnerData?.avatarUrl || "";
    const username = cloudOwnerData?.username || "";
    const content = cloud.type === "message"
        ?   cloud.data.text
        :   cloud.data.title
    ;
    
    const offset = useMemo(() => {
        return `calc(${(index * width) + (index * 5)}px)`;
    }, [index, width]);

    const openChat = useSettingsStore((state) => state.openChat);
    const closeCloud = useCloudStore((state) => state.closeCloud);
    const showMainMenu = useWindows((state) => state.showMainMenu);
	const hideMainMenu = useWindows((state) => state.hideMainMenu);
    const changeMainMenuTabState = useWindows((state) => state.changeMainMenuTabState);
    const closeAllSimilarClouds = useCloudStore((state) => state.closeAllSimilarClouds);
    const queryConversationByIdAndSelectIt = useConversationsStore((state) => state.queryConversationByIdAndSelectIt);
    
    const messageClickHandler = async () => {
        if(cloud.type === "notification") {
            closeCloud(index);
            openChat();
            showMainMenu();
            changeMainMenuTabState(true, "notifications");
            return;
        }

        if(cloud.type === "message") {
            await queryConversationByIdAndSelectIt(cloud.data.conversationId);
            closeAllSimilarClouds(index);
            hideMainMenu();
            openChat();
        }
    };

    const close = useCallback((e: MouseEvent<HTMLElement>) => {
        e?.stopPropagation();
        e?.preventDefault();
        closeCloud(index);
    }, [index, closeCloud]);

    const endTimeout = useCallback(() => {
        clearTimeout(timeout.current);
    }, [timeout]);

    const startTimeout = useCallback(() => {
        clearTimeout(timeout.current);
        timeout.current = setTimeout(() => {
            closeCloud(index);
        }, 5000);
    }, [timeout, close]);

    const getCloudOwnerData = async () => {
        if(cloud.type === "message") {
            const response = await getUserDataByIdAPI(cloud.data.sender._id);

            if(response && response.data) {
                setCloudOwnerData(response.data);
            }
        }

        if(cloud.type === "notification") {
            const response = await getUserDataByIdAPI(cloud.data.to);

            if(response && response.data) {
                setCloudOwnerData(response.data);
            }
        }
    }

    useEffect(() => {
        getCloudOwnerData();
    }, [cloud.type, index]);

    useEffect(() => {
        startTimeout();
    },[index, startTimeout]);

    useLayoutEffect(() => {
        const cloud = cloudRef.current;
        if(cloud) {
            setWidth(cloud.clientWidth);
        }
    }, [cloudRef]);

    return(
        <React.Fragment>
            <div
                ref={cloudRef} 
                style={{ right: offset }}
                onMouseEnter={endTimeout} 
                onMouseLeave={startTimeout}
                onClick={messageClickHandler} 
                className="wl-cb-messageCloud" 
            >
                {cloudOwnerData
                    ?   (
                            <React.Fragment>
                                <div className="wl-cb-messageCloudCloseBlock">
                                    <i onClick={close} className="chat-icon-close" />
                                </div>
                                <div className="wl-cb-messageCloudAvatarContainer">
                                    <div className="h-25 w-25 m-5">
                                        <Avatar avatarUrl={avatarUrl} isOnline />
                                    </div>
                                    <div className="wl-cb-messageCloudName">{username}</div>
                                </div>
                                <div className="wl-cb-messageCloudText mv-5">{content}</div>
                            </React.Fragment>
                        )
                    :   <WLSpinner />
                }
            </div>
        </React.Fragment>
    );
}

const CloudList = () => {
    const cloudList = useCloudStore((state) => state.cloudList);
    return(
        cloudList.map((cloud, cloudIndex) => (
            <Cloud
                cloud={cloud}
                index={cloudIndex}
                key={cloud.data._id} 
            />
        ))
    );
}

export default CloudList;
