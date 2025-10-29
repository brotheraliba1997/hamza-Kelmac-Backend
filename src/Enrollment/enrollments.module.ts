// src/modules/enrollments/enrollments.module.ts
import { Module } from '@nestjs/common';
import { EnrollmentsService } from './enrollments.service';
import { EnrollmentsController } from './enrollments.controller';
import { DocumentEnrollmentPersistenceModule } from './infrastructure/persistence/document/document-persistence.module';

@Module({
  imports: [DocumentEnrollmentPersistenceModule],
  controllers: [EnrollmentsController],
  providers: [EnrollmentsService],
  exports: [EnrollmentsService, DocumentEnrollmentPersistenceModule],
})
export class EnrollmentsModule {}
