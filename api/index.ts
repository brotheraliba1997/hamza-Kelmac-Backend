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
      logger: console,
    },
  );

  const configService = app.get(ConfigService);

  // CORS configuration
  const frontendDomain = configService.get<string>('app.frontendDomain');
  const nodeEnv = configService.get<string>('app.nodeEnv') || process.env.NODE_ENV || 'development';
  const allowedOrigins = [
    'http://localhost:3000',
    'http://localhost:5000',
    'http://127.0.0.1:3000',
    'http://127.0.0.1:5000',
  ];

  if (frontendDomain) {
    allowedOrigins.push(frontendDomain);
  }

  // In development, allow all localhost origins
  if (nodeEnv === 'development') {
    app.enableCors({
      origin: (origin, callback) => {
        // Allow requests with no origin (like mobile apps or curl requests)
        if (!origin) return callback(null, true);
        
        // Allow all localhost origins in development
        if (origin.startsWith('http://localhost') || origin.startsWith('http://127.0.0.1')) {
          return callback(null, true);
        }
        
        // Check if origin is in allowed list
        if (allowedOrigins.includes(origin)) {
          return callback(null, true);
        }
        
        callback(new Error('Not allowed by CORS'));
      },
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'x-custom-lang'],
    });
  } else {
    // Production: Allow localhost origins and configured frontend domain
    app.enableCors({
      origin: (origin, callback) => {
        // Allow requests with no origin (like mobile apps or curl requests)
        if (!origin) return callback(null, true);
        
        // Allow all localhost origins for local development against production API
        if (origin.startsWith('http://localhost') || origin.startsWith('http://127.0.0.1')) {
          return callback(null, true);
        }
        
        // Check if origin is in allowed list
        if (allowedOrigins.includes(origin)) {
          return callback(null, true);
        }
        
        callback(new Error('Not allowed by CORS'));
      },
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'x-custom-lang'],
    });
  }

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