// src/modules/enrollments/enrollments.module.ts
import { Module } from '@nestjs/common';
import { ClassScheduleController } from './class-schedule.controller';
import { ClassScheduleService } from './class-schedule.service';

import { MongooseModule } from '@nestjs/mongoose';
import {
  ClassScheduleSchema,
  ClassScheduleSchemaClass,
} from './schema/class-schedule.schema';

@Module({
  imports: [
    // ✅ Register your schema here
    MongooseModule.forFeature([
      { name: ClassScheduleSchemaClass.name, schema: ClassScheduleSchema }, // ✅ actual Schema object diya gaya
    ]),
  ],
  controllers: [ClassScheduleController],
  providers: [ClassScheduleService],
  exports: [ClassScheduleService],
})
export class ClassScheduleModule {}
