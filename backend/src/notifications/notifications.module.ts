import { BotModule } from "../bot/bot.module";
import { MongooseModule } from "@nestjs/mongoose";
import { Module, forwardRef } from "@nestjs/common";
import NotificationsModel from "./entities/notifications";
import { NotificationsService } from "./notifications.service";
import { NotificationsController } from "./notifications.controller";

const imports = [
    forwardRef(() => BotModule),
    MongooseModule.forFeature([NotificationsModel])
];

@Module({
    imports,
    providers: [NotificationsService], 
    controllers: [NotificationsController],
    exports: [NotificationsService],
})
export class NotificationsModule {}