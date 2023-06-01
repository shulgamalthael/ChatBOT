/* @nest.js */
import { createParamDecorator, ExecutionContext } from "@nestjs/common";
import { IUser } from "src/user/interfaces/user.interface";

export const Cookies = createParamDecorator(
  (data: string, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const cookie = request.cookies?.[data];
    let result = null;

    try {
      result = JSON.parse(cookie || "null");
    } catch { result = cookie; }
    
    return result;
  },
);

export const UserCookies = createParamDecorator(
	(_, ctx: ExecutionContext): IUser | null => {
		const request = ctx.switchToHttp().getRequest();
      const user = request.cookies?.['wlc_cud'] || request.cookies?.['wlc_gud'];
    	return JSON.parse(user || "null");
	},
);
