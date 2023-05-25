import { IsArray } from "class-validator";
import { IPage } from "../interfaces/page.interface";

export class AllowPagesDto {
	@IsArray()
	allowPages: IPage[];
}