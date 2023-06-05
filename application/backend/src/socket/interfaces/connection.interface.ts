/* interfaces */
import { Socket } from "socket.io"
import { IUser } from "../../user/interfaces/user.interface";

export interface IConnectedUser extends IUser {
	connectionId: string;
}

export interface IUserConnection {
	id: string,
	connection: Socket,
	userData: IConnectedUser,
}

export type Connections = Record<string, IUserConnection>;