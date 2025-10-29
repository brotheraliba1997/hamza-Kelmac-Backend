import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import {
  EnrollmentSchema,
  EnrollmentSchemaClass,
} from './entities/enrollments.schema';
import { EnrollmentRepository } from '../enrollments.repository';
import { EnrollmentsDocumentRepository } from './repositories/enrollments.repository';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: EnrollmentSchemaClass.name, schema: EnrollmentSchema },
    ]),
  ],
  providers: [
    {
      provide: EnrollmentRepository,
      useClass: EnrollmentsDocumentRepository,
    },
  ],
  exports: [EnrollmentRepository],
})
export class DocumentEnrollmentPersistenceModule {}
