/* @nest.js */
import { Module, NestModule, RequestMethod, MiddlewareConsumer } from '@nestjs/common';
import { ServeStaticModule } from '@nestjs/serve-static';

/* @path */
import { resolve } from 'path';

/* @mongoose */
import { MongooseModule } from '@nestjs/mongoose';
require("dotenv").config();

/* @modules */
import { BotModule } from './bot/bot.module';
import { ConfigModule } from '@nestjs/config';
import { UserModule } from './user/user.module';
import { SocketModule } from './socket/socket.module';
import { MulterModule } from '@nestjs/platform-express';
import { ConversationModule } from './conversation/conversation.module';
import { NotificationsModule } from './notifications/notifications.module';
import { AuthorizationMiddleware } from './middlewares/authorization.middleware';

const uploadsRootPath = process.env.ENV === "PRODUCTION" 
	? 	"./backend/uploads" 
	: 	resolve("uploads")
;

const staticRootPath = process.env.ENV === "PRODUCTION" 
	? 	"./backend/frontend_build" 
	: 	resolve("frontend_build")
;
// const mongodbserverString = process.env.ENV === "PRODUCTION" ? "user1:12345678@mongodb:27017" : "127.0.0.1:27017";
const mongodbserverString = process.env.ENV === "PRODUCTION" ? "mongodb:27017" : "127.0.0.1:27017";
const connectionString = `mongodb://${mongodbserverString}/ChatBOT`;
const deployMongooseConnection = MongooseModule.forRoot(connectionString);
const deployStaticFiles = ServeStaticModule.forRoot({ rootPath: staticRootPath });

const appImports = [
	BotModule,
	UserModule,
	SocketModule,
	ConversationModule,
	NotificationsModule,
	deployMongooseConnection,
	MulterModule.register({ dest: uploadsRootPath }),
	ConfigModule.forRoot({ envFilePath: '.env' }),
];

// if(process.env.ENV !== "PRODUCTION") {
	appImports.push(deployStaticFiles);
// }

@Module({
	imports: appImports,
	controllers: [],
	providers: [],
	exports: [ConversationModule, NotificationsModule, SocketModule, BotModule, ConfigModule],
})
export class AppModule implements NestModule {
	configure(consumer: MiddlewareConsumer) {
		consumer
			.apply(AuthorizationMiddleware)
			.forRoutes({ path: "/api", method: RequestMethod.ALL })
		;
	}
}
