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
	const hideMainMenu = useWindows((state) => state.hideMainMenu);
    const closeAllSimilarClouds = useCloudStore((state) => state.closeAllSimilarClouds);
    const queryConversationByIdAndSelectIt = useConversationsStore((state) => state.queryConversationByIdAndSelectIt);
    
    const messageClickHandler = useCallback(async () => {
        await queryConversationByIdAndSelectIt(cloud.data.conversationId);
        closeAllSimilarClouds(index);
        hideMainMenu();
        openChat();
    }, [index, cloud, closeCloud, queryConversationByIdAndSelectIt]);

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

    // const cloudList = Array(10).fill({
    //     type: "notification",
    //     data: {
    //         _id: "6474aa351cc86349525b3f64",
    //     title: "guest#9307 await You",
    //     accept: "conversation/staff/accept",
    //     decline: "conversation/staff/decline",
    //     actionType: "conversationStaffAwaition",
    //     staffList: [
    //         "646f659167785dea3af53cb9",
    //         "646f65bf67785dea3af53cf0",
    //         "646f65c867785dea3af53d1c",
    //         "646f65cf67785dea3af53d48"
    //     ],
    //     conversationId: "6470aa4e1dbaae42d6620e18",
    //     isSocketAction: true,
    //     from: "9307966241320590",
    //     to: "646f65cf67785dea3af53d48"
    //     }
    // });

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
