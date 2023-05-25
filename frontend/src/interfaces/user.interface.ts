export interface IConnectedUser extends IUser {
	connectionId: string;
}

export interface IUser {
	_id: string;
	role: string;
	email: string;
	username: string;
	avatarUrl: string;
	createdAt: string;
	lastVisitAt: string;
}