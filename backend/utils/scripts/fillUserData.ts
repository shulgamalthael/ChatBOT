/* @interfaces */
import { IUser } from "../../src/user/interfaces/user.interface";

export const fillUserData = (user: IUser): IUser => ({
    _id: JSON.parse(JSON.stringify(user._id)),
    role: user.role || "guest",
    email: user.email || "",
    isOnline: user.isOnline || false,
    username: user.username || "",
    avatarUrl: user.avatarUrl || "",
    businessId: user.businessId || "",
    createdAt: user.createdAt || new Date().toISOString(),
    lastVisitAt: user.lastVisitAt || new Date().toISOString(),
}); 