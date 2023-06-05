/* @nest.js */
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { ILiveChatDuration } from "../interfaces/liveAgentSettings.interface";

/* @mongoose */
import { Document } from "mongoose";

@Schema()
export class LiveAgentSettings extends Document {
    @Prop()
    triggerLink: string;

    @Prop()
    businessId: string;

    @Prop()
	responseDuration: number;

    @Prop({ type: "object" })
    liveChatDuration: ILiveChatDuration;
}

export const LiveAgentSettingsSchema = SchemaFactory.createForClass(LiveAgentSettings);

const LiveAgentSettingsModel = { name: LiveAgentSettings.name, schema: LiveAgentSettingsSchema };

export default LiveAgentSettingsModel;
