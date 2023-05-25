/* @zustand */
import { create } from "zustand";

/* @api */
import { queryOnlineUsersListAPI } from "../../api/api";

export const useUsersStore = create((set, get) => {
	const queryOnlineUsersList = async () => {
		const response = await queryOnlineUsersListAPI();
		response.isFetched && Array.isArray(response.data) && set({ usersList: response.data });
	}

	
	return {
		usersList: [],
		queryOnlineUsersList,
	}
});