/* @nest.js */
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";

/* @mongoose */
import { Document, Schema as MongooseSchema } from "mongoose";

@Schema()
export class User extends Document {
	@Prop()
	role: string;

	@Prop()
	email: string;

	@Prop()
	username: string;

	@Prop()
	avatarUrl: string;

	@Prop()
	businessId: string;

	@Prop()
	createdAt: string;

	@Prop()
	lastVisitAt: string;

	conversations: [{ type: MongooseSchema.Types.ObjectId, ref: 'conversations' }]
}

export const UserSchema = SchemaFactory.createForClass(User);

const UserModel = { name: User.name, schema: UserSchema };

export default UserModel;