/* @interfaces */
import { IConnectedUser } from "../../src/socket/interfaces/connection.interface";

export const getRandomNumber = (from: number, to: number): number => {
	return Math.floor(Math.random() * (to - from) + from);
}

export const generateId = (): string => {
	const idMapString = "01234567890";
	return Array(16).fill(null).map(el => idMapString[getRandomNumber(0, idMapString.length - 1)]).join("");
}

export const spawnGuest = (businessId: string, connectionId?: string): IConnectedUser => {
	const _id = generateId();

	return {
		_id,
		email: '',
		businessId,
		connectionId,
		role: 'guest',
		avatarUrl: '',
		createdAt: new Date().toISOString(),
		lastVisitAt: new Date().toISOString(),
		username: `guest#${_id.substring(0, 4)}`,
	};
};