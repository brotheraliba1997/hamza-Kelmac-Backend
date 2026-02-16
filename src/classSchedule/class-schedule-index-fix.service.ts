import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ClassScheduleSchemaClass } from './schema/class-schedule.schema';

/**
 * Fixes the securityKey_1 index that was created without sparse: true.
 * Multiple null securityKey values cause E11000 duplicate key error.
 * This service drops the old index on startup so Mongoose recreates it with sparse: true.
 */
@Injectable()
export class ClassScheduleIndexFixService implements OnModuleInit {
  private readonly logger = new Logger(ClassScheduleIndexFixService.name);

  constructor(
    @InjectModel(ClassScheduleSchemaClass.name)
    private readonly classScheduleModel: Model<ClassScheduleSchemaClass>,
  ) {}

  async onModuleInit() {
    try {
      await this.classScheduleModel.collection.dropIndex('securityKey_1');
      this.logger.log('Dropped securityKey_1 index');
      await this.classScheduleModel.syncIndexes();
      this.logger.log('Recreated indexes with sparse: true for securityKey');
    } catch (error: any) {
      if (error.code === 27 || error.codeName === 'IndexNotFound') {
        this.logger.log('securityKey_1 index not found, skipping');
      } else {
        this.logger.warn(`Could not fix securityKey index: ${error.message}`);
      }
    }
  }
}
