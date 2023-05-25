import { Module, forwardRef } from "@nestjs/common";
import { BotService } from "./bot.service";
import { BotController } from "./bot.controller";
import { MongooseModule } from "@nestjs/mongoose";
import { SocketModule } from "src/socket/socket.module";
import { ConversationModule } from "src/conversation/conversation.module";

import CommandsListModel from "./entities/commandsList";
import GeneralSettingsModel from "./entities/generalSettings";
import LiveAgentSettingsModel from "./entities/liveAgentSettings";

const imports = [
	forwardRef(() => SocketModule),
	forwardRef(() => ConversationModule),
	MongooseModule.forFeature([GeneralSettingsModel, CommandsListModel, LiveAgentSettingsModel]),
];

@Module({
	imports,
	providers: [BotService],
	controllers: [BotController],
	exports: [BotService]
})
export class BotModule {}