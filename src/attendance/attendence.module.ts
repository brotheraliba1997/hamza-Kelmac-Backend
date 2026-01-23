import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import {
  AttendanceSchemaClass,
  AttendanceSchema,
} from './schema/attendance.schema';
import {
  CourseSchemaClass,
  CourseSchema,
} from '../course/schema/course.schema';
import {
  PassFailRecordSchemaClass,
  PassFailRecordSchema,
} from './schema/pass-fail-record.schema';
import {
  ClassScheduleSchemaClass,
  ClassScheduleSchema,
} from '../classSchedule/schema/class-schedule.schema';
import { AttendanceService } from './attendance.service';
import { AttendanceController } from './attendence.controller';
import {
  AssignmentSchemaClass,
  AssigmentSchema,
} from '../assigment/schema/assigment.schema';
import { Notification, NotificationSchema } from '../notification/schema/notification.schema';
import { MailModule } from '../mail/mail.module';
import { UserSchemaClass, UserSchema } from '../users/schema/user.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: AttendanceSchemaClass.name, schema: AttendanceSchema },
      { name: AssignmentSchemaClass.name, schema: AssigmentSchema },

      { name: CourseSchemaClass.name, schema: CourseSchema },
      { name: PassFailRecordSchemaClass.name, schema: PassFailRecordSchema },
      { name: ClassScheduleSchemaClass.name, schema: ClassScheduleSchema },
      { name: Notification.name, schema: NotificationSchema },
      { name: UserSchemaClass.name, schema: UserSchema },
    ]),
    MailModule,
  ],
  controllers: [AttendanceController],
  providers: [AttendanceService],
  exports: [AttendanceService],
})
export class AttendanceModule {}
