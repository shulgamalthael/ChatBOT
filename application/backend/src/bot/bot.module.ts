import { BotService } from "./bot.service";
import { UserModule } from "../user/user.module";
import { BotController } from "./bot.controller";
import { MongooseModule } from "@nestjs/mongoose";
import { Module, forwardRef } from "@nestjs/common";
import { SocketModule } from "../socket/socket.module";
import { ConversationModule } from "../conversation/conversation.module";
import { NotificationsModule } from "../notifications/notifications.module";

import TwillioSettingsModel from "./entities/twillio";
import CommandsListModel from "./entities/commandsList";
import GeneralSettingsModel from "./entities/generalSettings";
import LiveAgentSettingsModel from "./entities/liveAgentSettings";

const imports = [
	forwardRef(() => UserModule),
	forwardRef(() => SocketModule),
	forwardRef(() => ConversationModule),
	forwardRef(() => NotificationsModule),
	MongooseModule.forFeature([GeneralSettingsModel, CommandsListModel, LiveAgentSettingsModel, TwillioSettingsModel]),
];

@Module({
	imports,
	providers: [BotService],
	controllers: [BotController],
	exports: [BotService]
})
export class BotModule {}