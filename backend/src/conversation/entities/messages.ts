/* @nest.js */
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";

/* @mongoose */
import { Document } from "mongoose";

@Schema()
export class Message extends Document {
	@Prop()
	text: string;

	@Prop()
	sender: string;

	@Prop()
	recipient: string;

	@Prop()
	sendedAt: string;

	@Prop()
	isReaded: boolean;
}

const MessageSchema = SchemaFactory.createForClass(Message);
export const MessageModel = { name: Message.name, schema: MessageSchema };

@Schema()
export class Messages extends Document {
	@Prop()
	messages: Message[]
}

const MessagesSchema = SchemaFactory.createForClass(Messages);
export const MessagesModel = { name: Messages.name, schema: MessagesSchema };