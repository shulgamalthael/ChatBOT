import { IsString, IsBoolean, IsNumber } from "class-validator";

export class NotificationDto {
    @IsString()
    title: string;

    @IsString()
    accept: string | null;

    @IsString()
    decline: string | null;

    @IsString()
    actionType: string;

    @IsBoolean()
    isSocketAction: boolean;

    @IsString()
    conversationId: string;

    @IsString()
    from: string;

    @IsString()
    to: string;

    @IsBoolean()
    isReaded: boolean;

    @IsNumber()
    staffList: string[];
}