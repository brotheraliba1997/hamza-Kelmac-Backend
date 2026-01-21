// src/modules/courses/courses.module.ts
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CoursesService } from './courses.service';
import { CoursesController } from './courses.controller';
import { CourseSchema, CourseSchemaClass } from './schema/course.schema';
import { MailModule } from '../mail/mail.module';
import { UserSchema, UserSchemaClass } from '../users/schema/user.schema';
import { CategoriesModule } from '../category/categories.module';
import { AssessmentItem, AssessmentItemSchema } from '../assessment-Items/schema/assessmentItem.schema';
import { Notification, NotificationSchema } from '../notification/schema/notification.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: CourseSchemaClass.name, schema: CourseSchema },
      { name: UserSchemaClass.name, schema: UserSchema },
      { name: AssessmentItem.name, schema: AssessmentItemSchema },
      { name: Notification.name, schema: NotificationSchema },
    ]),
    MailModule,
    CategoriesModule,
  ],
  controllers: [CoursesController],
  providers: [CoursesService],
  exports: [CoursesService],
})
export class CoursesModule {}
