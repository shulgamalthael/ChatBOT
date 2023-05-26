/* @zustand */
import { create } from "zustand";
import { queryNotificationsListAPI } from "../../api/api";

interface INotification {
    _id: string;
    title: string;
    accept: string;
    decline: string;
}

interface INotificationsStore {
    notificationsList: INotification[];
    queryNotificationsList: (offset: number) => void;
}

export const useNotificationsStore = create<INotificationsStore>((set, get): INotificationsStore => {
    const queryNotificationsList = async (offset: number) => {
        const response = await queryNotificationsListAPI(offset);

        if(response.isFetched && Array.isArray(response.data)) {
            set({ notificationsList: response.data });
        }
    }

    return {
        notificationsList: [],
        queryNotificationsList,
    }
});