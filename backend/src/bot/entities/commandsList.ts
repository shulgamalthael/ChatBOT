/* @nest.js */
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";

/* @mongoose */
import { Document } from "mongoose";
import { ICommand } from "../interfaces/command.interface";

@Schema()
export class CommandsList extends Document {
	@Prop()
	businessId: string;

	@Prop()
	commandsList: [ICommand]
}

export const CommandsListSchema = SchemaFactory.createForClass(CommandsList);

const CommandsListModel = { name: CommandsList.name, schema: CommandsListSchema };

export default CommandsListModel;