import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { EnrollmentService } from './enrollment.service';
import { EnrollmentController } from './enrollment.controller';
import {
  EnrollmentSchema,
  EnrollmentSchemaClass,
} from '../Enrollment/infrastructure/enrollments.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: EnrollmentSchemaClass.name, schema: EnrollmentSchema },
    ]),
  ],
  controllers: [EnrollmentController],
  providers: [EnrollmentService],
  exports: [EnrollmentService],
})
export class EnrollmentModule {}
