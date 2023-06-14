import { Get, Post, Delete, Query, Body, Controller, Request, Response, UploadedFile, UseInterceptors } from "@nestjs/common";
import { GeneralSettingsDto } from "./dto/generalSettingsDto";
import { FileInterceptor } from "@nestjs/platform-express";
import { BotService } from "./bot.service";
import { Request as IRequest, Response as IResponse } from "express";
import { CommandsListDto } from "./dto/commandsListDto";
import { AllowPagesDto } from "./dto/allowPagesDto";
import { LiveAgentSettingsDto } from "./dto/LiveAgentSettingsDto";
import { IGeneralSettings } from "./interfaces/generalSettings.interface";
import { UserCookies } from "utils/decorators/Cookie";
import { IUser } from "src/user/interfaces/user.interface";
import { TwillioSettingsDto } from "./dto/twillioSettingsDto";
import { TwillioMailerDto } from "./dto/twillioMailerDto";

@Controller("api/bot")
export class BotController {
	constructor(private readonly botService: BotService) {}

	@Get('/general')
	async getGeneralSettings(@Request() request: IRequest, @Response() response: IResponse) {
		const cookies = request.cookies;
		let user = cookies['wlc_cud'] || cookies['wlc_gud'] || '{}';
		user = JSON.parse(user);

		let generalSettings = cookies['wlc_gs'] || 'null';
		generalSettings = JSON.parse(generalSettings);

		if (generalSettings) {
			return response.json(generalSettings);
		}

		generalSettings = await this.botService.getGeneralSettings(user.businessId);

		return response.json(generalSettings);
	}

	@Post('/general')
	async saveGeneralSettings(@Body() body: GeneralSettingsDto, @Request() request: IRequest, @Response() response: IResponse) {
		const cookies = request.cookies;
		let user = cookies['wlc_cud'] || cookies['wlc_gud'] || '{}';
		user = JSON.parse(user);

		const generalSettings = await this.botService.saveGeneralSettings(body, user);
		return response.json(generalSettings);
	}

	@Get("/allowPages")
	async getAllowPages(@Request() request: IRequest, @Response() response: IResponse) {
		const cookies = request.cookies;
		let user = cookies['wlc_cud'] || cookies['wlc_gud'] || '{}';
		user = JSON.parse(user);

		const allowPages = await this.botService.getAllowPages(user);

		return response.json(allowPages);
	}

	@Post("/allowPages")
	async saveAllowPages(@Body() body: AllowPagesDto, @Request() request: IRequest) {
		const cookies = request.cookies;
		let user = cookies['wlc_cud'] || cookies['wlc_gud'] || '{}';
		user = JSON.parse(user);

		return this.botService.saveAllowPages(body, user);
	}

	@Delete("/allowPages")
	async deleteAllowPage(@Query('id') pageId: string, @Request() request: IRequest) {
		const cookies = request.cookies;
		let user = cookies['wlc_cud'] || cookies['wlc_gud'] || '{}';
		user = JSON.parse(user);

		return this.botService.deleteAllowPage(pageId, user);
	}

	@Get('/commandsList')
	async getCommandsList(@Request() request: IRequest, @Response() response: IResponse) {
		const cookies = request.cookies;
		let user = cookies['wlc_cud'] || cookies['wlc_gud'] || '{}';
		user = JSON.parse(user);

		const commandsList = await this.botService.getCommandsList(user);

		return response.json(commandsList);
	}

	@UseInterceptors(FileInterceptor('botAvatar'))
	@Post('/botAvatar')
	async saveBOTAvatar(@UploadedFile() botAvatar, @Request() request: IRequest, @Response() response: IResponse) {
		const cookies = request.cookies;
		let user = cookies['wlc_cud'] || cookies['wlc_gud'] || '{}';
		user = JSON.parse(user);

		const generalSettings = await this.botService.saveBOTAvatar(botAvatar, user);
		return response.json(generalSettings);
	}

	@Post('/commandsList')
	async saveCommandsList(@Body() body: CommandsListDto, @Request() request: IRequest, @Response() response: IResponse) {
		const cookies = request.cookies;
		let user = cookies['wlc_cud'] || cookies['wlc_gud'] || '{}';
		user = JSON.parse(user);

		const commandsList = await this.botService.saveCommandsList(body, user);

		return response.json(commandsList);
	}

	@Get('/liveAgentSettings')
	async getLiveAgentSettings(@Request() request: IRequest, @Response() response: IResponse) {
		const cookies = request.cookies;
		let user = cookies['wlc_cud'] || cookies['wlc_gud'] || '{}';
		user = JSON.parse(user);

		const liveAgentSettings = await this.botService.getLiveAgentSettings(user);

		return response.json(liveAgentSettings);
	}

	@Post('/liveAgentSettings')
	async saveLiveAgentSettings(@Body() body: LiveAgentSettingsDto, @Request() request: IRequest, @Response() response: IResponse) {
		const cookies = request.cookies;
		let user = cookies['wlc_cud'] || cookies['wlc_gud'] || '{}';
		user = JSON.parse(user);

		const liveAgentSettings = await this.botService.saveLiveAgentSettings(body, user);

		return response.json(liveAgentSettings);
	}

	@Get('/twillioSettings')
	async getTwillioSettings(@UserCookies() user: IUser) {
		return this.botService.getTwillioSettings(user.businessId);
	}

	@Post('/twillioSettings')
	async saveTwillioSettings(@Body() twillioSettingsDto: TwillioSettingsDto, @UserCookies() user: IUser) {
		return this.botService.saveTwillioSettings(twillioSettingsDto, user.businessId);
	}

	@Post('/sendTwillioMessage')
	async sendTwillioMessage(@Body() twillioMailerDto: TwillioMailerDto, @UserCookies() user: IUser) {
		return this.botService.sendTwillioMessage(twillioMailerDto, user.businessId);
	}

	@Get('/sendNodemailerMessage')
	async sendNodemailerMessage() {
		return this.botService.sendNodemailerMessage();
	}
}
