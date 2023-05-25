/* @nest.js */
import { Module } from "@nestjs/common";
import { forwardRef } from "@nestjs/common/utils";
import { MongooseModule } from "@nestjs/mongoose";

/* @controllers */
import { ConversationController } from "./conversation.controller";

/* @modules */
import { BotModule } from "../bot/bot.module";
import { SocketModule } from "../socket/socket.module";

/* @services */
import { ConversationService } from "./conversation.service";

/* @mongoose models */
import UserModel from "../user/entities/user";
import ConversationModel from "./entities/conversation";
import { MessageModel, MessagesModel } from "./entities/messages";

const injectedMongooseModels = MongooseModule.forFeature([
	UserModel,
	MessageModel,
	MessagesModel,
	ConversationModel,
]);

const conversationsModuleImports = [
	injectedMongooseModels,
	forwardRef(() => BotModule),
	forwardRef(() => SocketModule),
];

@Module({
	imports: conversationsModuleImports,
	controllers: [ConversationController],
	providers: [ConversationService],
	exports: [ConversationService]
})
export class ConversationModule {}