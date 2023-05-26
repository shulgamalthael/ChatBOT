/* @nest.js */
import { Module } from "@nestjs/common";
import { forwardRef } from "@nestjs/common/utils";
import { MongooseModule } from "@nestjs/mongoose";
import { SocketModule } from "../socket/socket.module";

/* @mongoose models */
import UserModel from "./entities/user";

/* @controllers */
import { UserController } from "./user.controller";

/* @services */
import { UserService } from "./user.service";
import { BotModule } from "../bot/bot.module";

const mongooseModels = MongooseModule.forFeature([UserModel]);

const UserModuleImports = [
	mongooseModels,
	forwardRef(() => BotModule),
	forwardRef(() => SocketModule),
];

@Module({
	imports: UserModuleImports,
	controllers: [UserController],
	providers: [UserService],
	exports: [UserService],
})
export class UserModule {}