/* @zustand */
import { create } from "zustand";

/* @api */
import { authorizeUserAPI } from "../../api/api";
import { useSettingsStore } from "../settings/settings";

export const fakeUserData = { username: 'Nikita', email: 'nikita@nikita.com' };

export const useUserStore = create((set, get) => {
	const fetchUserData = async (userData: Object) => {
		const trueUserData = userData
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