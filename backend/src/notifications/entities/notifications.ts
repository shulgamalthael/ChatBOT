/* @nest.js */
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";

/* @mongoose */
import { Document } from "mongoose";

export interface INotification {
    _id: string;
    to: string;
    from: string;
    title: string;
    isReaded: boolean;
    actionType: string;
    staffList: string[];
    accept: string | null;
    decline: string | null;
    conversationId: string;
    isSocketAction: boolean;
}

@Schema()
export class Notifications extends Document {
    @Prop()
    title: string;

    @Prop()
    accept: string | null;

    @Prop()
    decline: string | null;

    @Prop()
    actionType: string;

    @Prop()
    staffList: string[];

    @Prop()
    conversationId: string;

    @Prop()
    isSocketAction: boolean;

    @Prop()
    isReaded: boolean;

    @Prop()
    from: string;

    @Prop()
    to: string;
}

export const NotificationsSchema = SchemaFactory.createForClass(Notifications);

const NotificationsModel = { name: Notifications.name, schema: NotificationsSchema };

export default NotificationsModel;