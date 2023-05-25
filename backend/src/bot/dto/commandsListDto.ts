import { IsArray } from "class-validator";
import { ICommand } from "../interfaces/command.interface";

export class CommandsListDto {
	@IsArray()
	commandsList: ICommand[];
}