// src/modules/enrollments/enrollments.module.ts
import { Module } from '@nestjs/common';
import { ClassScheduleController } from './class-schedule.controller';
import { ClassScheduleService } from './class-schedule.service';
import { ClassScheduleHelperService } from '../utils/class-schedule/class-schedule-helper.service';
import { ClassScheduleIndexFixService } from './class-schedule-index-fix.service';

import { MongooseModule } from '@nestjs/mongoose';
import {
  ClassScheduleSchema,
  ClassScheduleSchemaClass,
} from './schema/class-schedule.schema';
import { MailModule } from '../mail/mail.module';
import { NotificationModule } from '../notification/notification.module';
import {
  CourseSchema,
  CourseSchemaClass,
} from '../course/schema/course.schema';
import { UserSchema, UserSchemaClass } from '../users/schema/user.schema';
import { GoogleOAuthProvider } from '../googleService/google.provider';
import {
  Notification,
  NotificationSchema,
} from '../notification/schema/notification.schema';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    UsersModule,
    // ✅ Register your schema here
    MongooseModule.forFeature([
      { name: ClassScheduleSchemaClass.name, schema: ClassScheduleSchema },
      { name: CourseSchemaClass.name, schema: CourseSchema },
      { name: UserSchemaClass.name, schema: UserSchema },
      { name: Notification.name, schema: NotificationSchema },
    ]),
    MailModule,
    NotificationModule,
  ],
  controllers: [ClassScheduleController],
  providers: [
    ClassScheduleService,
    ClassScheduleHelperService,
    ClassScheduleIndexFixService,
    GoogleOAuthProvider,
  ],
  exports: [ClassScheduleService, ClassScheduleHelperService],
})
export class ClassScheduleModule {}
