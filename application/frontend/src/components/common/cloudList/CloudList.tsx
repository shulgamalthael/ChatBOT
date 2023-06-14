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
    const [cloudOwnerData, setCloudOwnerData] = useState<IUserData | null>(null);
    const timeout = useRef<NodeJS.Timeout | undefined>(undefined);

    const cloudRef = useRef<HTMLDivElement>(null);

    const avatarUrl = cloudOwnerData?.avatarUrl || "";
    const username = cloudOwnerData?.username || "";
    const content = cloud.type === "message"
        ?   cloud.data.text
        :   cloud.data.title
    ;
    
    const openChat = useSettingsStore((state) => state.openChat);
    const closeCloud = useCloudStore((state) => state.closeCloud);
    const showMainMenu = useWindows((state) => state.showMainMenu);
	const hideMainMenu = useWindows((state) => state.hideMainMenu);
    const changeMainMenuTabState = useWindows((state) => state.changeMainMenuTabState);
    const closeAllSimilarClouds = useCloudStore((state) => state.closeAllSimilarClouds);
    const queryConversationByIdAndSelectIt = useConversationsStore((state) => state.queryConversationByIdAndSelectIt);
    
    const messageClickHandler = async (e: MouseEvent<HTMLDivElement>) => {
        e?.preventDefault();
        e?.stopPropagation();

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

    return(
        <React.Fragment>
            <div
                ref={cloudRef}
                onMouseEnter={endTimeout} 
                onMouseLeave={startTimeout}
                onClick={messageClickHandler} 
                className="wl-cb-messageCloud" 
            >
                {cloudOwnerData
                    ?   (
                            <React.Fragment>
                                <div onClick={close} className="wl-cb-messageCloudCloseBlock">
                                    <i className="chat-icon-close" />
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

const CloseAllButton = () => {
    const cloudList = useCloudStore((state) => state.cloudList);
    const closeAllClouds = useCloudStore((state) => state.closeAllClouds);

    const closeAllCloudsCallback = useCallback((e: MouseEvent<HTMLDivElement>) => {
        e?.preventDefault();
        e?.stopPropagation();

        closeAllClouds();
    }, [closeAllClouds]);

    if(!Array.isArray(cloudList) || cloudList.length < 2) {
        return null;
    }

    return(
        <div 
            onClick={closeAllCloudsCallback} 
            className="wl-cb-cloud-closeAll h-25 w-25 absolute flex flex-col flex-center items-center top-half cursor-pointer br-full bg-primary color-secondary"
        >
            +
        </div>
    )
}

const CloudList = () => {
    const cloudList = useCloudStore((state) => state.cloudList);

    // const cloudList = Array(10).fill({
    //     "type": "message",
    //     "data": {
    //         "_id": "4324815019688797",
    //         "conversationId": "648723ffef763030a4f48c25",
    //         "isReaded": false,
    //         "text": "wadawdaw",
    //         "sendedAt": "2023-06-12T13:56:15.408Z",
    //         "sender": {
    //             "_id": "4444",
    //             "username": "Ahill BOT"
    //         },
    //         "recipients": [
    //             {
    //                 "_id": "0335481386183841",
    //                 "username": "guest#0335"
    //             }
    //         ],
    //         "unreadedMessagesCount": 0
    //     }
    // });

    return(
        <div className="wl-cb-cloudList fixed bottom-0 right-0 w-200 mr-5">
            <CloseAllButton />
            {cloudList.map((cloud, cloudIndex) => (
                <Cloud
                    cloud={cloud}
                    index={cloudIndex}
                    key={cloud.data._id} 
                />
            ))}
        </div>
    );
}

export default CloudList;
