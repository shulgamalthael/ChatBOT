/* @nest.js */
import { Module } from '@nestjs/common';
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

const staticRootPath = process.env.ENV === "PRODUCTION" ? resolve("backend", "frontend_build") : resolve("frontend_build");
// const mongodbserverString = process.env.ENV === "PRODUCTION" ? "user1:12345678@mongodb:27017" : "127.0.0.1:27017";
const mongodbserverString = process.env.ENV === "PRODUCTION" ? "mongodb:27017" : "127.0.0.1:27017";
const connectionString = `mongodb://${mongodbserverString}/ChatBOT`;
console.log({ connectionString });
const deployMongooseConnection = MongooseModule.forRoot(connectionString);
const deployStaticFiles = ServeStaticModule.forRoot({ rootPath: staticRootPath });

const appImports = [
	UserModule,
	BotModule,
	SocketModule,
	deployStaticFiles,
	ConversationModule,
	deployMongooseConnection,
	ConfigModule.forRoot({ envFilePath: '.env' }),
	MulterModule.register({ dest: "./uploads" }),
];

@Module({
	imports: appImports,
	controllers: [],
	providers: [],
	exports: [ConversationModule, SocketModule, BotModule, ConfigModule],
})
export class AppModule {}
