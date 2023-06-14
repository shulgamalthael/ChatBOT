/* @zustand */
import produce from "immer";
import { create } from "zustand";

/* @api */
import { IUserData } from "../socket/socket";
import { useWindows } from "../windows/windows";
import { useSettingsStore } from "../settings/settings";
import { IGenericObjectType } from "../../interfaces/genericObjectType";
import { authorizeUserAPI, changeUserRoleAPI, sendUserDataFormFromConversationAPI } from "../../api/api";
import { useConversationsStore } from "../conversations/conversations";

export const fakeUserData = { username: 'Nikita', email: 'nikita@nikita.com' };

export interface IUserForm {
	email: string;
	username: string;
	conversationId?: string;
}

interface IUserStore {
	userData: IUserData | null;

	isUserDataFetched: boolean;
	isUserDataFetching: boolean;

	updateAuthorizationState: () => void;
	changeUserRole: (role: string) => void;
	fetchUserData: (userData: IUserData) => void;
	sendUserData: (userForm: IUserForm) => Promise<void>;
	updateUserDataFetchingState: (prop: boolean) => void;
}

export const useUserStore = create<IUserStore>((set, get): IUserStore => {
	const sendUserData = async (userForm: IUserForm) => {
		const selectedConversation = useConversationsStore.getState().selectedConversation;

		if(!/^\S+@\S+\.\S+$/.test(userForm.email) || !userForm.username || !selectedConversation) {
			return;
		}

		get().updateUserDataFetchingState(false);

		const response = await sendUserDataFormFromConversationAPI({...userForm, conversationId: selectedConversation._id});

		if(response.isFetched && response.data) {
			set({ userData: response.data });
		}

		get().updateUserDataFetchingState(true);
	}
	
	const updateUserDataFetchingState = (prop: boolean) => {
		set({
			isUserDataFetched: prop,
			isUserDataFetching: !prop
		});
	}

	const changeUserRole = async (role: string) => {
		updateUserDataFetchingState(false);
		const response = await changeUserRoleAPI(role);

		if(response.isFetched && response.data) {
			set(produce((draft) => {
				draft.userData = response.data;
				useWindows.getState().hideMainMenu();
				// useSocketStore.getState().processSocketConnection();
			}));
		}

		updateUserDataFetchingState(true);
	}

	const fetchUserData = async (userData: Object) => {
		const trueUserData: IGenericObjectType = userData
			? 	userData
			: 	{ businessId: "4444" }
		;

		const { isFetched, data } = await authorizeUserAPI(trueUserData);
		if(isFetched && data) {
			set({ userData: data });
			useSettingsStore.getState().updateAuthorizingState(true);
		}
	}

	const updateAuthorizationState = () => {
		useSettingsStore.getState().updateAuthorizingState(!!get().userData);
	}
	
	return {
		userData: null,
		isUserDataFetched: false,
		isUserDataFetching: false,
		sendUserData,
		fetchUserData,
		changeUserRole,
		updateAuthorizationState,
		updateUserDataFetchingState,
	}
});