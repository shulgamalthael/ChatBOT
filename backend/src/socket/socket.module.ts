/* @nest.js */
import { Module } from '@nestjs/common';
import { BotModule } from 'src/bot/bot.module';
import { forwardRef } from '@nestjs/common/utils';
import { MongooseModule } from '@nestjs/mongoose';
import { ConversationModule } from '../conversation/conversation.module';
import { ConversationModel } from '../conversation/entities/conversation';

/* @gateway */
import { SocketGateway } from './socket.gateway';

/* @services */
import { SocketService } from './socket.service';
import { NotificationsModule } from '../notifications/notifications.module';
import { UserModule } from 'src/user/user.module';

const SocketModuleImports = [
	forwardRef(() => BotModule),
	forwardRef(() => UserModule),
	forwardRef(() => ConversationModule),
	forwardRef(() => NotificationsModule),
	MongooseModule.forFeature([ConversationModel]),
];

@Module({
	imports: SocketModuleImports,
	controllers: [],
	providers: [SocketService, SocketGateway],
	exports: [SocketService],
})
export class SocketModule {};