import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  MongooseModuleOptions,
  MongooseOptionsFactory,
} from '@nestjs/mongoose';
import { AllConfigType } from '../config/config.type';
// Ensure we import the plugin as a function. Depending on tsconfig and package build,
// default import can resolve to an object with a default property, which breaks plugin registration.
// Using namespace import is safest across CJS/ESM interop.
import * as mongooseAutoPopulate from 'mongoose-autopopulate';

@Injectable()
export class MongooseConfigService implements MongooseOptionsFactory {
  constructor(private configService: ConfigService<AllConfigType>) {}

  createMongooseOptions(): MongooseModuleOptions {
    return {
      uri: this.configService.get('database.url', { infer: true }),
      dbName: this.configService.get('database.name', { infer: true }),
      user: this.configService.get('database.username', { infer: true }),
      pass: this.configService.get('database.password', { infer: true }),
      // Connection stability defaults (override via env if needed)
      serverSelectionTimeoutMS:
        Number(process.env.MONGO_SERVER_SELECTION_TIMEOUT_MS) || 5000,
      connectTimeoutMS: Number(process.env.MONGO_CONNECT_TIMEOUT_MS) || 10000,
      maxPoolSize: Number(process.env.MONGO_MAX_POOL_SIZE) || 10,
      connectionFactory(connection) {
        // TEMPORARILY DISABLED: mongoose-autopopulate has compatibility issues with Mongoose 8
        // causing "callback is not a function" in stateMachine.js. Use manual .populate() instead.
        // To re-enable, uncomment the block below:
        /*
        const pluginFn: unknown = (mongooseAutoPopulate as unknown as any)
          .default
          ? (mongooseAutoPopulate as unknown as any).default
          : (mongooseAutoPopulate as unknown as any);

        if (typeof pluginFn === 'function') {
          connection.plugin(
            pluginFn as Parameters<typeof connection.plugin>[0],
          );
        } else {
          console.warn(
            '[mongoose] autopopulate plugin not applied: expected function, got',
            typeof pluginFn,
          );
        }
        */
        return connection;
      },
    };
  }
}
