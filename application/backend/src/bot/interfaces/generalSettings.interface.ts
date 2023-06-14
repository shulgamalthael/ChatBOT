import { IPage } from "./page.interface";

export interface IGeneralSettings {
    allowPages?: IPage[];
    botName: string;
    enabled: boolean;
    botAvatar: string;
    businessId?: string;
    showingChatTimer: number;
    messageSendingTimer: number;
}