/* @zustand */
import produce from "immer";
import { create } from "zustand";
import useSocketStore from "../socket/socket";
import { queryNotificationsListAPI } from "../../api/api";
import { useCloudStore } from "../cloud/cloud";

export interface INotification {
    _id: string;
    title: string;
    accept: string;
    decline: string;
    actionType: string;
    staffList: string[];
    conversationId: string;
    isSocketAction: boolean;
    from: string;
    to: string;
}

// interface INotificationCloudState {
//     list: INotification[];
//     addMessage: (notification: INotification) => void;
//     closeMessage: (notificationIndex: number) => void;
// }

interface INotificationsStore {
    notificationsList: INotification[];
    processNotificationsListUpdating: () => void;
    // notificationsCloudState: INotificationCloudState;
    queryNotificationsList: (offset: number) => void;
    processInputNotification: (message: string) => void;
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
    
    const queryNotificationsList = async (offset: number = 0) => {
        const response = await queryNotificationsListAPI(offset);

        if(response.isFetched && Array.isArray(response.data)) {
            set({ notificationsList: response.data });
        }
    }

    const processNotificationsListUpdating = () => {
        queryNotificationsList();
    }

    const processInputNotification = (message: string): void => {
        const notification = JSON.parse(message || "null");
        if(!notification) {
            return;
        }
        
        set(produce((draft) => {
            draft.notificationsList.push(notification);
        }));
        
        useCloudStore.getState().addCloud(notification, "notification");
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
        acceptNotification,
        declineNotification,
        queryNotificationsList,
        processInputNotification,
        processNotificationsListUpdating,
    }
});