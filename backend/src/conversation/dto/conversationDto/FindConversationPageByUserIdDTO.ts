/* @class-validator */
import { IsString } from "class-validator";

export class FindConversationsPageByUserIdDTO {
	@IsString()
	limit: string;

	@IsString()
	offset: string;
}