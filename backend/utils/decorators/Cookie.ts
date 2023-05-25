/* @nest.js */
import { createParamDecorator, ExecutionContext } from "@nestjs/common";

/* @express */
import { Request as IRequest } from 'express';

export const Cookie = createParamDecorator(function (cookieName: string, context: ExecutionContext) {
	const request: IRequest = context.switchToHttp().getRequest();

	return request.cookies?.[cookieName] || {};
});