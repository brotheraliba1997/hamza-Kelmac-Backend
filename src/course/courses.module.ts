// src/modules/courses/courses.module.ts
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CoursesService } from './courses.service';
import { CoursesController } from './courses.controller';
import {
  CourseSchema,
  CourseSchemaClass,
} from './infrastructure/persistence/document/entities/course.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: CourseSchemaClass.name, schema: CourseSchema },
    ]),
  ],
  controllers: [CoursesController],
  providers: [CoursesService],
  exports: [CoursesService],
})
export class CoursesModule {}
