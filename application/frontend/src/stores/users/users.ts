/* @zustand */
import { create } from "zustand";

/* @api */
import { queryOnlineUsersListAPI, queryStaffListAPI } from "../../api/api";
import { IUserData } from "../socket/socket";

interface IUsersStore {
	usersList: IUserData[];
	staffList: IUserData[];
	queryStaffList: (offset: number) => void;
	queryOnlineUsersList: (offset: number) => void;
}

export const useUsersStore = create<IUsersStore>((set, get): IUsersStore => {
	const queryOnlineUsersList = async () => {
		const response = await queryOnlineUsersListAPI();
		response.isFetched && Array.isArray(response.data) && set({ usersList: response.data });
	}

	const queryStaffList = async (offset: number = 1) => {
		const response = await queryStaffListAPI(offset);

		if(response.isFetched && Array.isArray(response.data)) {
			set({ staffList: response.data });
		}
	}

	
	return {
		usersList: [],
		staffList: [],
		queryStaffList,
		queryOnlineUsersList,
	}
});