/* @zustand */
import produce from "immer";
import { create } from "zustand";
import { INotification } from "../notifications/notificationsStore";
import { IInputMessage } from "../../interfaces/conversation.interface";

export interface ICloud {
    type: "message" | "notification";
    data: IInputMessage | INotification;
}

interface ICloudStoreState {
    cloudList: ICloud[];
    closeAllClouds: () => void;
    closeCloud: (cloudIndex: number) => void;
    closeAllSimilarClouds: (cloudIndex: number) => void;
    addCloud: (cloud: IInputMessage | INotification, type: string) => void;
}

export const useCloudStore = create<ICloudStoreState>((set, get): ICloudStoreState => {
    const addCloud = (cloud: IInputMessage | INotification, type: string): void => {
        set(produce((draft) => {
            const cloudData = { type, data: cloud };
            draft.cloudList.push(cloudData);
        }));
    }

    const closeAllClouds = (): void => {
        set(produce((draft: ICloudStoreState) => {
            draft.cloudList = [];
        }));
    }

    const closeCloud = (cloudIndex: number): void => {
        set(produce((draft: ICloudStoreState) => {
            if(draft.cloudList.length > cloudIndex) {
                draft.cloudList.splice(cloudIndex, 1);
            }
        }));
    }

    const closeAllSimilarClouds = (cloudIndex: number): void => {
        const cloudList = get().cloudList;

        if(!cloudList[cloudIndex] || cloudList[cloudIndex].type !== "message") {
            return;
        }

        set(produce((draft: ICloudStoreState) => {
            draft.cloudList = draft.cloudList.filter((cloud) => {
                if(cloud.type === "notification") {
                    return true;
                }

                if(cloud.type === "message" && cloud.data.conversationId === cloudList[cloudIndex].data.conversationId) {
                    return false;
                }

                return true;
            });
        }));
    }
    
    return {
        cloudList: [],
        addCloud,
        closeCloud,
        closeAllClouds,
        closeAllSimilarClouds,
    }
});