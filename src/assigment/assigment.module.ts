
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AssignmentSchemaClass, AssigmentSchema } from './schema/assigment.schema';
import { CourseSchemaClass, CourseSchema } from '../course/schema/course.schema';

import { ClassScheduleSchemaClass, ClassScheduleSchema } from '../classSchedule/schema/class-schedule.schema';
import { AssigmentController } from './assigment.controller';
import { AssignmentService } from './assigment.service';
import { AssigmentPassFailRecordSchemaClass, PassFailRecordSchema } from './schema/pass-fail-record.schema';


@Module({
  imports: [
    MongooseModule.forFeature([
      { name: AssignmentSchemaClass.name, schema: AssigmentSchema },
      { name: CourseSchemaClass.name, schema: CourseSchema },
      { name: AssigmentPassFailRecordSchemaClass.name, schema: PassFailRecordSchema },
      { name: ClassScheduleSchemaClass.name, schema: ClassScheduleSchema },
    ]),
  ],
  controllers: [AssigmentController],
  providers: [AssignmentService],
  exports: [AssignmentService],
})
export class AssigmentModule {}

