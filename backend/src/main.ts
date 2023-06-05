/* @modules */
import { AppModule } from './app.module';

/* @nest.js */
import { NestFactory } from '@nestjs/core';

/* @path */
import { resolve, join } from "path";

/* @file-sistem */
import { readFileSync } from 'fs';

/* @cookie-parser */
import * as cookieParser from 'cookie-parser';
import { ValidationPipe } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';

require("dotenv").config();

const appPath = process.env.ENV === "PRODUCTION"
	?	resolve("backend")
	:	resolve()

const securityBedPath = process.env.ENV === "PRODUCTION"
	?	join(appPath, "security")
	:	join("security")
;

const certificate = readFileSync(join(securityBedPath, "localhost4488.pem"));
const privateKey = readFileSync(join(securityBedPath, "localhost-privateKey4488.pem"));

const appOptions = {
	httpsOptions: { key: privateKey, cert: certificate },
	cors: { origin: ['https://localhost', 'https://localhost:443', 'https://localhost:80', 'https://localhost:3000', 'https://localhost:5000', 'http://127.0.0.1:5500', 'https://localhost:4488'], credentials: true },
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
	app.useStaticAssets(join(appPath, "assets"), { prefix: "/assets" });
	app.useStaticAssets(join(appPath, "uploads"), { prefix: "/uploads" });
	// app.useStaticAssets(join(appPath, "frontend_build"), { prefix: "/static" });

	await app.listen(4488);
}
bootstrap();
