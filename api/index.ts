import { NestFactory } from '@nestjs/core';
import { AppModule } from '../src/app.module';
import {
  ValidationPipe,
  VersioningType,
  ClassSerializerInterceptor,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Reflector } from '@nestjs/core';
import { ExpressAdapter } from '@nestjs/platform-express';
import express, { Request, Response } from 'express';
import * as path from 'path';

process.chdir(path.join(__dirname, '..')); // keep this if needed

const expressApp = express();
let isBootstrapped = false;

async function bootstrap() {
  if (isBootstrapped) return;
  const app = await NestFactory.create(
    AppModule,
    new ExpressAdapter(expressApp),
    {
      cors: true,
      logger: console,
    },
  );

  const configService = app.get(ConfigService);

  app.setGlobalPrefix(configService.get('app.apiPrefix', 'api'), {
    exclude: ['/'],
  });

  app.enableVersioning({
    type: VersioningType.URI,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
    }),
  );

  app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector)));

  await app.init();
  isBootstrapped = true;
}

export default async function handler(req: Request, res: Response) {
  try {
    await bootstrap();
    return expressApp(req, res); // ✅ call express directly
  } catch (error: any) {
    console.error('Request handler error:', error);
    return res.status(500).json({
      error: 'Serverless function failed',
      message: error.message,
    });
  }
}