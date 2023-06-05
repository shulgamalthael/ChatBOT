/* @class-validator */
import { IsString } from "class-validator";

export class ConversationMessagesPagination {
	@IsString()
	limit: string;

	@IsString()
	offset: string;
}