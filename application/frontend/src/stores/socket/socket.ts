/* zustand */
import { create } from "zustand";

/* @socket.io */
import { Socket, io } from "socket.io-client";
import config from "../../api/config";

export interface IUserData {
	_id: string;
	role: string;
	email: string;
	username: string;
	isOnline: boolean;
	avatarUrl: string;
	createdAt: string;
	businessId: string;
	lastVisitAt: string;
}

export interface ISocketStore {
	socket: Socket | null;
	processSocketConnection: () => void;
	processSocketDisconnection: () => void;
}

const useSocketStore = create<ISocketStore>((set: Function, get: Function): ISocketStore => {
	const processSocketConnection = () => {
		console.log('new Socket Connection', new Date().toISOString());
		let socket = get().socket;
		if(socket && socket.connected) {
			socket.disconnect();
		}

		socket = io(config.baseApiUrl, { transports: ['websocket', 'polling'] });
		set({ socket });
	}

	const processSocketDisconnection = () => {
		let socket = get().socket;
		if(socket) {
			socket.disconnect();
		}
	}

	return {
		socket: null,
		processSocketConnection,
		processSocketDisconnection
	}
});

export default useSocketStore;