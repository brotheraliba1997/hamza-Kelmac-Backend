import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import {
  AssessmentItem,
  AssessmentItemSchema,
} from './schema/assessmentItem.schema';
import { AssessmentItemController } from './assessmentItem.controller';
import { AssessmentItemService } from './assessmentItem.services';
import {
  CourseSchema,
  CourseSchemaClass,
} from '../course/schema/course.schema';
import { Notification, NotificationSchema } from '../notification/schema/notification.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: AssessmentItem.name, schema: AssessmentItemSchema },
      { name: CourseSchemaClass.name, schema: CourseSchema }, 
      { name: Notification.name, schema: NotificationSchema },
    ]),
  ],
  controllers: [AssessmentItemController],
  providers: [AssessmentItemService],
})
export class AssessmentItemModule {}
