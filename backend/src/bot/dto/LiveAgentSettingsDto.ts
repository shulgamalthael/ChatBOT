import { IsString, IsNumber, IsObject } from "class-validator";

export class LiveAgentSettingsDto {
    @IsString()
    triggerLink: string;

    @IsNumber()
	responseDuration: number;

    @IsObject()
    liveChatDuration: {
        enabled: boolean;
        duration: number;
    }
}