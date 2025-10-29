// src/modules/courses/courses.module.ts
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CoursesService } from './courses.service';
import { CoursesController } from './courses.controller';
import {
  CourseSchema,
  CourseSchemaClass,
} from './infrastructure/persistence/document/entities/course.schema';
import { DocumentCoursesPersistenceModule } from './infrastructure/persistence/document/document-persistence.module';

@Module({
  imports: [DocumentCoursesPersistenceModule],
  controllers: [CoursesController],
  providers: [CoursesService],
  exports: [CoursesService, DocumentCoursesPersistenceModule],
})
export class CoursesModule {}
