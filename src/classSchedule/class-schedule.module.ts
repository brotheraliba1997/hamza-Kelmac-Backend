// src/modules/enrollments/enrollments.module.ts
import { Module } from '@nestjs/common';
import { ClassScheduleController } from './class-schedule.controller';
import { ClassScheduleService } from './class-schedule.service';

import { MongooseModule } from '@nestjs/mongoose';
import {
  ClassScheduleSchema,
  ClassScheduleSchemaClass,
} from './schema/class-schedule.schema';
import { MailModule } from '../mail/mail.module';
import {
  CourseSchema,
  CourseSchemaClass,
} from '../course/schema/course.schema';
import { UserSchema, UserSchemaClass } from '../users/schema/user.schema';

@Module({
  imports: [
    // ✅ Register your schema here
    MongooseModule.forFeature([
      { name: ClassScheduleSchemaClass.name, schema: ClassScheduleSchema }, // ✅ actual Schema object diya gaya
      { name: CourseSchemaClass.name, schema: CourseSchema },
      { name: UserSchemaClass.name, schema: UserSchema },
    ]),
    MailModule,
  ],
  controllers: [ClassScheduleController],
  providers: [ClassScheduleService],
  exports: [ClassScheduleService],
})
export class ClassScheduleModule {}
