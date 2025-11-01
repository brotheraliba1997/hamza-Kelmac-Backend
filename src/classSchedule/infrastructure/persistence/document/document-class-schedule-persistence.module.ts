import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import {
  ClassScheduleSchema,
  ClassScheduleSchemaClass,
} from './entities/class-schedule.schema';

import { ClassScheduleDocumentRepository } from './repositories/class-schedule-document.repository';
import { ClassScheduleRepository } from '../../class-schedule.repository';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: ClassScheduleSchemaClass.name, schema: ClassScheduleSchema },
    ]),
  ],
  providers: [
    {
      provide: ClassScheduleRepository,
      useClass: ClassScheduleDocumentRepository,
    },
  ],
  exports: [ClassScheduleRepository],
})
export class DocumentClassSchedulePersistenceModule {}
