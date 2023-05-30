import { BotModule } from "../bot/bot.module";
import { MongooseModule } from "@nestjs/mongoose";
import { Module, forwardRef } from "@nestjs/common";
import NotificationsModel from "./entities/notifications";
import { NotificationsService } from "./notifications.service";
import { NotificationsController } from "./notifications.controller";
import { ConversationModule } from "../conversation/conversation.module";
import { SocketModule } from "src/socket/socket.module";

const imports = [
    forwardRef(() => BotModule),
    forwardRef(() => SocketModule),
    forwardRef(() => ConversationModule),
    MongooseModule.forFeature([NotificationsModel])
];

@Module({
    imports,
    providers: [NotificationsService], 
    controllers: [NotificationsController],
    exports: [NotificationsService],
})
export class NotificationsModule {}