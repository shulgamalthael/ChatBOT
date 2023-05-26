/* @interfaces */
import { IUser } from "../../src/user/interfaces/user.interface";

export const fillUserData = (user: IUser): IUser => ({
    _id: JSON.parse(JSON.stringify(user._id)),
    role: user.role,
    email: user.email,
    username: user.username,
    avatarUrl: user.avatarUrl,
    businessId: user.businessId,
    createdAt: user.createdAt,
    lastVisitAt: user.lastVisitAt
}); 