/* @zustand */
import produce from "immer";
import { create } from "zustand";
import useSocketStore from "../socket/socket";
import { useCloudStore } from "../cloud/cloud";
import { queryNotificationsListAPI, readConversationMessagesApi, readNotificationsAPI } from "../../api/api";
import { useWindows } from "../windows/windows";
import { useUserStore } from "../user/user";

export interface INotification {
    _id: string;
    to: string;
    from: string;
    title: string;
    accept: string;
    decline: string;
    isReaded: boolean;
    actionType: string;
    staffList: string[];
    conversationId: string;
    isSocketAction: boolean;
}

// interface INotificationCloudState {
//     list: INotification[];
//     addMessage: (notification: INotification) => void;
//     closeMessage: (notificationIndex: number) => void;
// }

interface INotificationsStore {
    notificationsList: INotification[];
    unreadedNotificationsCount: number;
    processNotificationsListUpdating: () => void;
    calculateUnreadedNotificationsCount: () => void;
    queryNotificationsList: (offset: number) => void;
    processInputNotification: (message: string) => void;
    // notificationsCloudState: INotificationCloudState;
    acceptNotification: (notification: INotification) => void;
    declineNotification: (notification: INotification) => void;
}

export const useNotificationsStore = create<INotificationsStore>((set, get): INotificationsStore => {
    const acceptNotification = (notification: INotification) => {
        const socket = useSocketStore.getState().socket;
        const notificationsList = get().notificationsList;
        if(!socket || !notification || !notification.accept) {
            return;
        }

        const notificationIndex = notificationsList.findIndex((_notification) => {
            return _notification._id === notification._id;
        });

        if(notificationIndex >= 0) {
            set(produce((draft) => {
                draft.notificationsList.splice(notificationIndex, 1);
            }));
    
            socket.emit(notification.accept, JSON.stringify(notification));
        }
    }

    const declineNotification = (notification: INotification) => {
        const socket = useSocketStore.getState().socket;
        const notificationsList = get().notificationsList;
        if(!socket || !notification || !notification.decline) {
            return;
        }

        const notificationIndex = notificationsList.findIndex((_notification) => {
            return _notification._id === notification._id;
        });

        if(notificationIndex >= 0) {
            set(produce((draft) => {
                draft.notificationsList.splice(notificationIndex, 1);
            }));
    
            socket.emit(notification.decline, JSON.stringify(notification));
        }
    }
    
    const queryNotificationsList = async (offset: number = 1) => {
        const response = await queryNotificationsListAPI(offset);

        if(response.isFetched && Array.isArray(response.data)) {
            set({ notificationsList: response.data });
            get().calculateUnreadedNotificationsCount();
        }
    }

    const processNotificationsListUpdating = () => {
        const userData = useUserStore.getState().userData;
        const userRole = userData?.role;

        if(userRole === "guest" || userRole === "user") {
            return;
        }

        queryNotificationsList();
    }

    const processInputNotification = (message: string): void => {
        const notification = JSON.parse(message || "null");

        const userData = useUserStore.getState().userData;
        const userRole = userData?.role;

        if(!notification || userRole === "guest" || userRole === "user") {
            return;
        }

        set(produce((draft) => {
            draft.notificationsList.push(notification);
        }));
        
        useCloudStore.getState().addCloud(notification, "notification");

        if(useWindows.getState().mainMenuState.tabState.tabName === "notifications") {
            readNotificationsAPI();
        }
        
        get().calculateUnreadedNotificationsCount();
    }

    const calculateUnreadedNotificationsCount = () => {
        set(produce((draft: INotificationsStore) => {
            draft.unreadedNotificationsCount = draft.notificationsList.reduce((acc, notification) => {
                if(!notification.isReaded) {
                    acc += 1;
                }
                
                return acc;
            }, 0);
        }));
    }

    // const addCloudNotification = (notification: INotification) => {
    //     if(!notification || !notification._id) {
    //         return;
    //     }

    //     set(produce((draft) => {
    //         draft.notificationsCloudState.list.push(notification);
    //     }));
    // }

    // const closeCloudNotification = (notificationIndex: number) => {
    //     set(produce((draft) => {
    //         if(draft.notificationsCloudState.list.length > notificationIndex) {
    //             draft.notificationsCloudState.list.splice(notificationIndex, 1);
    //         }
    //     }))
    // }

    return {
        // notificationsCloudState: {
        //     list: [],
        //     addMessage: addCloudNotification,
        //     closeMessage: closeCloudNotification
        // },
        notificationsList: [],
        unreadedNotificationsCount: 0,
        acceptNotification,
        declineNotification,
        queryNotificationsList,
        processInputNotification,
        processNotificationsListUpdating,
        calculateUnreadedNotificationsCount,
    }
});