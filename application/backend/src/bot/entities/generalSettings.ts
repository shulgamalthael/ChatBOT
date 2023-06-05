/* @nest.js */
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";

/* @mongoose */
import { Document } from "mongoose";
import { IPage } from "../interfaces/page.interface";

@Schema()
export class GeneralSettings extends Document {
	@Prop()
	businessId: string;

	@Prop()
	botName: string;

	@Prop()
	enabled: boolean;

	@Prop()
	showingChatTimer: number;

	@Prop()
	messageSendingTimer: number;

	@Prop()
	botAvatar: string | null;

	@Prop()
	allowPages: IPage[];
}

export const GeneralSettingsSchema = SchemaFactory.createForClass(GeneralSettings);

const GeneralSettingsModel = { name: GeneralSettings.name, schema: GeneralSettingsSchema };

export default GeneralSettingsModel;