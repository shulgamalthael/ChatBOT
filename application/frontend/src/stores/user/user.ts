/* @zustand */
import { create } from "zustand";

/* @api */
import { authorizeUserAPI } from "../../api/api";
import { useSettingsStore } from "../settings/settings";
import { IUserData } from "../socket/socket";
import { IGenericObjectType } from "../../interfaces/genericObjectType";

export const fakeUserData = { username: 'Nikita', email: 'nikita@nikita.com' };

interface IUserStore {
	userData: IUserData | null,
	fetchUserData: (userData: IUserData) => void;
}

export const useUserStore = create<IUserStore>((set, get): IUserStore => {
	const fetchUserData = async (userData: Object) => {
		const trueUserData: IGenericObjectType = userData
			? userData
			: { businessId: "4444" }
		;

		const { isFetched, data } = await authorizeUserAPI(trueUserData);
		if(isFetched && data) {
			set({ userData: data });
			const settings = useSettingsStore.getState();
			settings.updateAuthorizingState(true);
		}
	}
	
	return {
		userData: null,
		fetchUserData,
	}
});