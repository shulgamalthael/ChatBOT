/* @class-validator */
import { IsString } from "class-validator";

export class TwillioMailerDto {
    @IsString()
    number: string;

    @IsString()
    message: string;
}