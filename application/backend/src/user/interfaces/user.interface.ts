export interface IUser {
	_id: string;
	role: string;
	email: string;
	username: string;
	avatarUrl: string;
	createdAt: string;
	businessId: string;
	isOnline?: boolean;
	lastVisitAt: string;
	connectionId?: string;
}
