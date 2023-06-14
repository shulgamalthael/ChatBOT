/* @axios */
import { request } from "./axios";

/* @constansts */
import { defaultLimit } from "../constants/params";
import { IGenericObjectType } from "../interfaces/genericObjectType";
import { IConversationData } from "../interfaces/conversation.interface";
import { ICommand, IGeneralSettings, ILiveAgentSettings, IMailerState, IPage, ITwillioSettings } from "../stores/botSettings/botSettingsStore";
import { IUserForm } from "../stores/user/user";

export const readNotificationsAPI = () => {
	return request("/api/notifications/read");
}

export const getUserDataByIdAPI = (userId: string) => {
	return request(`/api/user/byId/${userId}`);
}

export const startSupportingByStaffAPI = (conversationId: string, staffId: string) => {
	return request(`/api/conversation/startSupportingByStaff?conversationId=${conversationId}&staffId=${staffId}`);
}

export const endSupportingByStaffAPI = (conversationId: string) => {
	return request(`/api/conversation/endSupportingByStaff?conversationId=${conversationId}`);
}

export const queryNotificationsListAPI = (offset: number = 1) => {
	return request(`/api/notifications/list?offset=${offset}`);
}

export const queryOnlineUsersListAPI = (offset: number = 1) => {
	return request(`/api/user/list?offset=${offset}`);
}

export const queryStaffListAPI = (offset: number = 1) => {
	return request(`/api/user/staff/list?offset=${offset}`);
}

export const queryConversationByIdAPI = (conversationId: string, offset = 1) => {
	return request(`/api/conversation/id/${conversationId}?offset=${offset}`);
}

export const authorizeUserAPI = (userData: IGenericObjectType) => {
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

export const changeUserRoleAPI = (role: string) => {
	return request(`/api/user/role/change?role=${role}`);
}

export const queryTwillioSettingsAPI = () => {
	return request("/api/bot/twillioSettings");
}

export const saveTwillioSettingsAPI = (twillioSettings: ITwillioSettings) => {
	return request(`/api/bot/twillioSettings`, 'POST', twillioSettings);
}

export const sendTwillioMessageAPI = (twillioMailer: IMailerState) => {
	return request(`/api/bot/sendTwillioMessage`, 'POST', twillioMailer);
}

export const sendNodemailerMessageAPI = () => {
	return request('/api/bot/sendNodemailerMessage');
}

export const sendUserDataFormFromConversationAPI = (userForm: IUserForm) => {
	return request('/api/user/formDataFromConversation', 'POST', userForm);
}
