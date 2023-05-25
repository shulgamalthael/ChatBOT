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

@Controller('api/conversation')
export class ConversationController {
	constructor(private readonly conversationService: ConversationService) {}
	@HttpCode(HttpStatus.OK)
	@Get('/id/:id')
	getConversationById(@Param('id') id: string, @Query() queryParams: ConversationMessagesPagination, @Request() request: IRequest) {
		const cookies = request.cookies;
		let user = JSON.parse(cookies['wlc_cud'] || cookies['wlc_gud'] || '{}');
		let generalSettings = JSON.parse(cookies['wlc_gs'] || '{}');
		return this.conversationService.getConversationById(id, user, queryParams, generalSettings);
	}

	@HttpCode(HttpStatus.OK)
	@Get('/list')
	async getConversationsPageByUserId(@Query() queryParams: FindConversationsPageByUserIdDTO, @Request() request: IRequest) {
		const cookies = request.cookies;
		let user = JSON.parse(cookies['wlc_cud'] || cookies['wlc_gud'] || '{}');
		let generalSettings = JSON.parse(cookies['wlc_gs'] || '{}');
		return await this.conversationService.getConversationsPageByUserId(queryParams, user, generalSettings);
	}

	@Get('/read/:id')
	async readConversationMessages(@Param('id') conversationId: string, @Request() request: IRequest) {
		const cookies = request.cookies;
		let user = JSON.parse(cookies['wlc_cud'] || cookies['wlc_gud'] || '{}');
		return await this.conversationService.readConversationMessages(conversationId, user);
	}

	@Post('/create')
	async createConversation(@Body() conversationDto: ConversationDto, @Request() request: IRequest, @Response() response: IResponse) {
		const cookies = request.cookies;
		let user = JSON.parse(cookies['wlc_cud'] || cookies['wlc_gud'] || '{}');
		let generalSettings = JSON.parse(cookies['wlc_gs'] || 'null');
		return await this.conversationService.createConversation(conversationDto, user, generalSettings, response);
	}

	@Get("/newConversationSession")
	async refreshConversation(@Query('id') conversationId: string, @Request() request: IRequest, @Response() response: IResponse) {
		const cookies = request.cookies;
		let user = JSON.parse(cookies['wlc_cud'] || cookies['wlc_gud'] || '{}');
		let generalSettings = JSON.parse(cookies['wlc_gs'] || 'null');
		return response.json(await this.conversationService.getNewConversationSession(conversationId, user, generalSettings));
	}
}
