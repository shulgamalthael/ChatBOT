import { IsString, IsBoolean } from "class-validator";

export class TwillioSettingsDto {
    @IsString()
    number: string;

    @IsString()
    accountSid: string;

    @IsBoolean()
    enabled: boolean;

    @IsString()
    accountAuthToken: string;

    @IsString()
    businessId?: string;
}