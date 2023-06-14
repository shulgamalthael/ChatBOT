import { IsString } from "class-validator";

export class UserFormFromConversationDto {
    @IsString()
    email: string;
    
    @IsString()
    username: string;

    @IsString()
    conversationId: string;
}