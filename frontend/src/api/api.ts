/* @axios */
import { request } from "./axios";

/* @interfaces */
import { IUserData } from "../stores/socket/socket";

/* @constansts */
import { defaultLimit } from "../constants/params";
import { ICommand, IGeneralSettings, ILiveAgentSettings, IPage } from "../stores/botSettings/botSettingsStore";
import { IConversationData } from "../interfaces/conversation.interface";

export const queryOnlineUsersListAPI = () => {
	return request("/api/user/list");
}

export const queryConversationByIdAPI = (conversationId: string, offset = 1) => {
	return request(`/api/conversation/id/${conversationId}?offset=${offset}`);
}

export const authorizeUserAPI = (userData: IUserData) => {
	return request("/api/user/authorization", "POST", userData);
}

export interface QueryConversationsListParams { offset?: number, limit?: number };

export const queryConversationsListAPI = (params: QueryConversationsListParams) => {
	const { offset = 1, limit = defaultLimit } = params;
	
	return request(`/api/conversation/list?offset=${offset}&limit=${limit}`);
}

export const createConversationApi = (newConversationData: IConversationData, offset = 1) => {
	return request(`/api/conversation/create`, "POST", newConversationData);
}

export const saveGeneralSettingsApi = (settings: IGeneralSettings | FormData) => {
	return request("/api/bot/general", "POST", settings);
}

export const saveBOTAvatarApi = (settings: FormData) => {
	return request("/api/bot/botAvatar", "POST", settings);
}

export const saveCommandsListApi = (commandsList: ICommand[]) => {
	return request("/api/bot/commandsList", "POST", { commandsList });
}

export const getCommandsListApi = () => {
	return request("/api/bot/commandsList");
}

export const getGeneralSettingsApi = () => {
	return request("/api/bot/general");
}

export const getAllowPagesApi = () => {
	return request("/api/bot/allowPages");
}

export const saveAllowPagesListApi = (allowPages: IPage[]) => {
	return request("/api/bot/allowPages", "POST", { allowPages });
}

export const deleteAllowPageApi = (pageId: string) => {
	return request(`/api/bot/allowPages?id=${pageId}`, "DELETE");
}

export const readConversationMessagesApi = (conversationId: string) => {
	return request(`/api/conversation/read/${conversationId}`);
}

export const getLiveAgentSettingsApi = () => {
	return request(`/api/bot/liveAgentSettings`);
}

export const saveLiveAgentSettingsApi = (liveAgentSettings: ILiveAgentSettings) => {
	return request(`/api/bot/liveAgentSettings`, "POST", liveAgentSettings);
}

export const getNewConversationSessionApi = (conversationId: string) => {
	return request(`/api/conversation/newConversationSession?id=${conversationId}`);
}
