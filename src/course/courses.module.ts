// src/modules/courses/courses.module.ts
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CoursesService } from './courses.service';
import { CoursesController } from './courses.controller';
import { CourseSchema, CourseSchemaClass } from './schema/course.schema';
import { MailModule } from '../mail/mail.module';
import { UserSchema, UserSchemaClass } from '../users/schema/user.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: CourseSchemaClass.name, schema: CourseSchema },
      { name: UserSchemaClass.name, schema: UserSchema },
    ]),
    MailModule,
  ],
  controllers: [CoursesController],
  providers: [CoursesService],
  exports: [CoursesService],
})
export class CoursesModule {}
