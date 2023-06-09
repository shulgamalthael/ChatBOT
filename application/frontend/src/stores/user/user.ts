/* @zustand */
import produce from "immer";
import { create } from "zustand";

/* @api */
import { authorizeUserAPI, changeUserRoleAPI } from "../../api/api";
import { useSettingsStore } from "../settings/settings";
import useSocketStore, { IUserData } from "../socket/socket";
import { IGenericObjectType } from "../../interfaces/genericObjectType";
import { useWindows } from "../windows/windows";

export const fakeUserData = { username: 'Nikita', email: 'nikita@nikita.com' };

interface IUserStore {
	userData: IUserData | null;

	isUserDataFetched: boolean;
	isUserDataFetching: boolean;

	updateAuthorizationState: () => void;
	changeUserRole: (role: string) => void;
	fetchUserData: (userData: IUserData) => void;
}

export const useUserStore = create<IUserStore>((set, get): IUserStore => {
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
		fetchUserData,
		changeUserRole,
		updateAuthorizationState
	}
});