/* @class-validator */
import { IsBoolean, IsString } from "class-validator";

export class ConversationDto {
	@IsBoolean()
	isNew: boolean;

	@IsString()
	businessId: string;

	@IsString()
	franchiseId: string;
	
	@IsString({ each: true })
	recipients: string[];
}