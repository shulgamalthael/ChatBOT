/* @nest.js */
import { Controller, Post, Body, HttpCode, HttpStatus, Request, Get, Query, Param, Response } from '@nestjs/common';

/* @services */
import { ConversationService } from './conversation.service';

/* @express */
import { Request as IRequest, Response as IResponse } from 'express';

/* @dto */
import { ConversationDto } from './dto/conversationDto/ConversationDto';
import { FindConversationsPageByUserIdDTO } from './dto/conversationDto/FindConversationPageByUserIdDTO';
import { ConversationMessagesPagination } from './dto/conversationDto/ConversationMessagesPagination';
import { UserCookies } from 'utils/decorators/Cookie';
import { IUser } from 'src/user/interfaces/user.interface';

@Controller('api/conversation')
export class ConversationController {
	constructor(private readonly conversationService: ConversationService) {}
	@HttpCode(HttpStatus.OK)
	@Get('/id/:id')
	getConversationById(
		@Param('id') id: string, 
		@UserCookies() user: IUser,
		@Query() queryParams: ConversationMessagesPagination, 
	) {
		return this.conversationService.getConversationById(id, user, queryParams);
	}

	@HttpCode(HttpStatus.OK)
	@Get('/list')
	async getConversationsPageByUserId(
		@UserCookies() user: IUser,
		@Query() queryParams: FindConversationsPageByUserIdDTO, 
	) {
		return this.conversationService.getConversationsPageByUserId(queryParams, user);
	}

	@Get('/read/:id')
	async readConversationMessages(
		@UserCookies() user: IUser,
		@Param('id') conversationId: string, 
	) {
		return this.conversationService.readConversationMessages(conversationId, user);
	}

	@Post('/create')
	async createConversation(
		@UserCookies() user: IUser,
		@Body() conversationDto: ConversationDto, 
	) {
		return this.conversationService.createConversation(conversationDto, user);
	}

	@Get("/newConversationSession")
	async refreshConversation(
		@UserCookies() user: IUser,
		@Query('id') conversationId: string,
	) {
		return this.conversationService.getNewConversationSession(conversationId, user);
	}

	@Get("/startSupportingByStaff")
	async startConversationSupportingByStaff(
		@UserCookies() user: IUser,
		@Query('staffId') staffId: string,
		@Query('conversationId') conversationId: string, 
	) {
		return this.conversationService.startConversationSupportingByStaff(conversationId, staffId, user);
	}

	@Get("/endSupportingByStaff")
	async endConversationSupportingByStaff(
		@UserCookies() user: IUser,
		@Query('conversationId') conversationId: string, 
	) {
		return this.conversationService.endConversationSupportingByStaff(conversationId, user);
	}
}
