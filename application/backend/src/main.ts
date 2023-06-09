/* @modules */
import { AppModule } from './app.module';

/* @nest.js */
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";

/* @path */
import { resolve } from "path";

/* @file-sistem */
import { readFileSync } from 'fs';

/* @cookie-parser */
import * as cookieParser from 'cookie-parser';
import { ValidationPipe } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';

require("dotenv").config();

const appPath = process.env.ENV === "PRODUCTION"
	?	"./backend"
	:	resolve()
;

const securityBedPath = `${appPath}/security`;

const certificate = readFileSync(`${securityBedPath}/localhost4488.pem`);
const privateKey = readFileSync(`${securityBedPath}/localhost-privateKey4488.pem`);

const appOptions = {
	httpsOptions: { key: privateKey, cert: certificate },
	cors: { origin: [
			'https://localhost', 
			'https://localhost:443', 
			'https://localhost:80', 
			'https://localhost:3000', 
			'https://localhost:5000', 
			'http://127.0.0.1:5500', 
			'https://localhost:4488',
			'https://localhost:4001',
			'https://localhost:4487'
		], credentials: true 
	},
}

const validationPipe = new ValidationPipe({
	whitelist: true,
	// transform: true,
	skipNullProperties: true,
	forbidUnknownValues: true,
	forbidNonWhitelisted: true,
	skipMissingProperties: true,
	skipUndefinedProperties: true,
	// transformOptions: {
	// 	enableImplicitConversion: true
	// }
});

async function bootstrap() {
	const app = await NestFactory.create<NestExpressApplication>(AppModule, appOptions);
	app.useGlobalPipes(validationPipe);
	app.use(cookieParser());
	app.useStaticAssets(`${appPath}/assets`, { prefix: "/assets" });
	app.useStaticAssets(`${appPath}/uploads`, { prefix: "/uploads" });

	const options = new DocumentBuilder()
	.setTitle('WL-ChatBOT')
	.setDescription('WL ChatBOT application')
	.setVersion('1.0')
	.build()
;
	const document = SwaggerModule.createDocument(app, options);
	SwaggerModule.setup('documentation', app, document);

	await app.listen(process.env.PORT || 4488);
}
bootstrap();
