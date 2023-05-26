import { Get, Post, Delete, Query, Body, Controller, Request, Response, UploadedFile, UseInterceptors } from "@nestjs/common";
import { GeneralSettingsDto } from "./dto/generalSettingsDto";
import { FileInterceptor } from "@nestjs/platform-express";
import { BotService } from "./bot.service";
import { Request as IRequest, Response as IResponse } from "express";
import { CommandsListDto } from "./dto/commandsListDto";
import { AllowPagesDto } from "./dto/allowPagesDto";
import { LiveAgentSettingsDto } from "./dto/LiveAgentSettingsDto";

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

		generalSettings = await this.botService.getGeneralSettings(user);

		response.cookie('wlc_gs', JSON.stringify(generalSettings), { sameSite: 'none', secure: true });

		return response.json(generalSettings);
	}

	@Post('/general')
	async saveGeneralSettings(@Body() body: GeneralSettingsDto, @Request() request: IRequest, @Response() response: IResponse) {
		const cookies = request.cookies;
		let user = cookies['wlc_cud'] || cookies['wlc_gud'] || '{}';
		user = JSON.parse(user);

		const generalSettings = await this.botService.saveGeneralSettings(body, user);
		response.cookie('wlc_gs', JSON.stringify(generalSettings), { sameSite: 'none', secure: true });

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
	async saveAllowPages(@Body() body: AllowPagesDto, @Request() request: IRequest, @Response() response: IResponse) {
		const cookies = request.cookies;
		let user = cookies['wlc_cud'] || cookies['wlc_gud'] || '{}';
		user = JSON.parse(user);

		const allowPages = await this.botService.saveAllowPages(body, user);

		return response.json(allowPages);
	}

	@Delete("/allowPages")
	async deleteAllowPage(@Query('id') pageId: string, @Request() request: IRequest, @Response() response: IResponse) {
		const cookies = request.cookies;
		let user = cookies['wlc_cud'] || cookies['wlc_gud'] || '{}';
		user = JSON.parse(user);

		const allowPages = await this.botService.deleteAllowPage(pageId, user);

		return response.json(allowPages);
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
		response.cookie('wlc_gs', JSON.stringify(generalSettings), { sameSite: 'none', secure: true });

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

		let liveAgentSettings = cookies['wlc_las'] || 'null';
		liveAgentSettings = JSON.parse(liveAgentSettings);

		if(liveAgentSettings) {
			return response.json(liveAgentSettings);
		}

		liveAgentSettings = await this.botService.getLiveAgentSettings(user);

		response.cookie('wlc_las', JSON.stringify(liveAgentSettings), { sameSite: 'none', secure: true });

		return response.json(liveAgentSettings);
	}

	@Post('/liveAgentSettings')
	async saveLiveAgentSettings(@Body() body: LiveAgentSettingsDto, @Request() request: IRequest, @Response() response: IResponse) {
		const cookies = request.cookies;
		let user = cookies['wlc_cud'] || cookies['wlc_gud'] || '{}';
		user = JSON.parse(user);

		const liveAgentSettings = await this.botService.saveLiveAgentSettings(body, user);

		response.cookie('wlc_las', JSON.stringify(liveAgentSettings), { sameSite: 'none', secure: true });

		return response.json(liveAgentSettings);
	}
}
