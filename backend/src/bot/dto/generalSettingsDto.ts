import { IsBoolean, IsNumber, IsString } from "class-validator";

export class GeneralSettingsDto {
	@IsString()
	botName: string;

	@IsBoolean()
	enabled: boolean;

	@IsNumber()
	showingChatTimer: number;

	@IsNumber()
	messageSendingTimer: number;

	@IsString()
	botAvatar: string | null;
}