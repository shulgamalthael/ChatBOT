/* @class-validator */
import { IsString } from "class-validator";

export class UserDto {
	@IsString()
	id?: string;
	
	@IsString()
	businessId: string;

	@IsString()
	role?: string;
	
	@IsString()
	email?: string;
	
	@IsString()
	username?: string;
	
	@IsString()
	createdAt?: string;
	
	@IsString()
	avatarUrl?: string;
	
	@IsString()
	lastVisitAt?: string;
}