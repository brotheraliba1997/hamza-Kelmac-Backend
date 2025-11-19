import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AttendanceSchemaClass, AttendanceSchema } from './schema/attendance.schema';
import { CourseSchemaClass, CourseSchema } from '../course/schema/course.schema';
import { AttendanceService } from './attendance.service';
import { AttendanceController } from './attendence.controller';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: AttendanceSchemaClass.name, schema: AttendanceSchema },
      { name: CourseSchemaClass.name, schema: CourseSchema },
    ]),
  ],
  controllers: [AttendanceController],
  providers: [AttendanceService],
  exports: [AttendanceService],
})
export class AttendanceModule {}

