import { configure } from '@codegenie/serverless-express';
import { NestFactory } from '@nestjs/core';
import { AppModule } from '../src/app.module';
import { 
  ValidationPipe, 
  VersioningType, 
  ClassSerializerInterceptor 
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Reflector } from '@nestjs/core';
import * as path from 'path';
import { Request, Response } from 'express';

// Set correct working directory for serverless
process.chdir(path.join(__dirname, '..'));

let cachedServer: any = null;

async function bootstrapServer() {
  try {
    const app = await NestFactory.create(AppModule, {
      cors: true,
      logger: console,
      abortOnError: false, // Don't crash on module errors
    });

    const configService = app.get(ConfigService);

    app.setGlobalPrefix(
      configService.get('app.apiPrefix', 'api'),
      { exclude: ['/'] }
    );

    app.enableVersioning({
      type: VersioningType.URI,
    });

    app.useGlobalPipes(new ValidationPipe({
      transform: true,
      whitelist: true,
    }));

    app.useGlobalInterceptors(
      new ClassSerializerInterceptor(app.get(Reflector)),
    );

    await app.init();
    
    const expressApp = app.getHttpAdapter().getInstance();
    return configure({ app: expressApp });
  } catch (error) {
    console.error('Bootstrap failed:', error);
    throw error;
  }
}

export default async (req:Request, res:Response) => {
  try {
    if (!cachedServer) {
      cachedServer = await bootstrapServer();
    }
    return cachedServer(req, res);
  } catch (error: any) {
    console.error('Request handler error:', error);
    return res.status(500).json({ 
      error: 'Serverless function failedd',
      message: error.message 
    });
  }
};