/* @nest.js */
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";

/* @mongoose */
import { Document } from "mongoose";

export interface TwillioSettings {
    number: string;
    accountSid: string;
    enabled: boolean;
    accountAuthToken: string;
}

@Schema()
export class TwillioSettings extends Document {
    @Prop()
    number: string;
    
    @Prop()
	enabled: boolean;

    @Prop()
    businessId: string;
    
    @Prop()
    accountSid: string;

    @Prop()
    accountAuthToken: string;
}

export const TwillioSettingsSchema = SchemaFactory.createForClass(TwillioSettings);

const TwillioSettingsModel = { name: TwillioSettings.name, schema: TwillioSettingsSchema };

export default TwillioSettingsModel;
