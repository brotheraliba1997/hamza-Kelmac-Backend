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

process.chdir(path.join(__dirname, '..'));

const expressApp = express();
let isBootstrapped = false;

async function bootstrap() {
  if (isBootstrapped) return;

  const app = await NestFactory.create(
    AppModule,
    new ExpressAdapter(expressApp),
    {
      logger: console,
    },
  );

  const configService = app.get(ConfigService);

  // ===========================
  // ✅ All Allowed Origins Here
  // ===========================
  const allowedOrigins = [
    'http://localhost:3000',
    'http://localhost:5000',
    'http://localhost:3001',
    'http://127.0.0.1:3000',
    'http://127.0.0.1:5000',
    'http://127.0.0.1:3001',
    // ==== Vercel Frontend Domains ====
    'https://kelmac-frontend-kelmac-dev.vercel.app',
    'https://kelmac-dashboard-g33j.vercel.app',
    'https://kelmac-frontend.vercel.app',
  ];

  // ===================================================
  // ✅ MUST HAVE: Preflight OPTIONS request always OK
  // ===================================================
  expressApp.use((req: any, res: any, next) => {
    if (req.method === 'OPTIONS') {
      res.header('Access-Control-Allow-Origin', req.headers.origin || '*');
      res.header(
        'Access-Control-Allow-Methods',
        'GET,PUT,POST,DELETE,PATCH,OPTIONS',
      );
      res.header(
        'Access-Control-Allow-Headers',
        'Content-Type, Authorization, x-custom-lang',
      );
      return res.sendStatus(200);
    }
    next();
  });

  // ================================
  // 🔥 Production Safe CORS Handler
  // ================================
  app.enableCors({
    origin: (
      origin: string | undefined,
      callback: (err: Error | null, allow?: boolean) => void,
    ) => {
      if (!origin) return callback(null, true); // mobile apps, curl, postman

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      console.log('❌ Blocked by CORS:', origin);
      return callback(new Error('Not allowed by CORS'));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'x-custom-lang'],
  });

  // Global Prefix
  app.setGlobalPrefix(configService.get('app.apiPrefix', 'api'), {
    exclude: ['/'],
  });

  // API Versioning
  app.enableVersioning({
    type: VersioningType.URI,
  });

  // Pipes
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
    }),
  );

  // Serializer
  app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector)));

  await app.init();
  isBootstrapped = true;
}

// Serverless handler (Vercel entry)
export default async function handler(req: Request, res: Response) {
  try {
    await bootstrap();
    return expressApp(req, res);
  } catch (error: any) {
    console.error('Request handler error:', error);
    return res.status(500).json({
      error: 'Serverless function failed',
      message: error.message,
    });
  }
}
