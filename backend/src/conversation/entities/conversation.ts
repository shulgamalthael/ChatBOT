/* @mongoose */
import { Document } from "mongoose";

/* @nest.js */
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";

/* @interfaces */
import { IOutputMessage } from "../../socket/interfaces/message.interface";

@Schema()
export class Conversation extends Document {
	@Prop()
	creator: string;
	
	@Prop()
	createdAt: string;

	@Prop()
	businessId: string;

	@Prop()
	franchiseId: string;

	@Prop()
	recipients: string[];

	@Prop()
	isConversationWaitingStuff?: boolean;
	
	@Prop()
	messages: IOutputMessage[];
}

export const ConversationSchema = SchemaFactory.createForClass(Conversation);

export const ConversationModel = { name: Conversation.name, schema: ConversationSchema };

export default ConversationModel;