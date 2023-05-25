/* @modules */
import { AppModule } from './app.module';

/* @nest.js */
import { NestFactory } from '@nestjs/core';

/* @path */
import { resolve } from "path";

/* @file-sistem */
import { readFileSync } from 'fs';

/* @cookie-parser */
import * as cookieParser from 'cookie-parser';
import { ValidationPipe } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';

require("dotenv").config();

const securityBedPath = process.env.ENV
	?	resolve("backend", "security")
	:	resolve("security")
;

const isProduction = process.env.ENV === "PRODUCTION";

const certificate = readFileSync(`${securityBedPath}/localhost4488.pem`);
const privateKey = readFileSync(`${securityBedPath}/localhost-privateKey4488.pem`);

const appOptions = {
	httpsOptions: { key: privateKey, cert: certificate },
	cors: { origin: ['https://localhost:3000', 'https://localhost:80', 'https://localhost:5000'], credentials: true },
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
	app.useStaticAssets(resolve("uploads"), { prefix: "/uploads" });

	await app.listen(4488);
}
bootstrap();
