import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { EnrollmentService } from './enrollment.service';
import { EnrollmentController } from './enrollment.controller';
import {
  EnrollmentSchema,
  EnrollmentSchemaClass,
} from '../Enrollment/infrastructure/enrollments.schema';
import { Notification, NotificationSchema } from '../notification/schema/notification.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: EnrollmentSchemaClass.name, schema: EnrollmentSchema },
      { name: Notification.name, schema: NotificationSchema },
    ]),
  ],
  controllers: [EnrollmentController],
  providers: [EnrollmentService],
  exports: [EnrollmentService],
})
export class EnrollmentModule {}
