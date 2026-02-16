import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { FeedbackAnswerController } from './feedback-answer.controller';
import { FeedbackAnswerService } from './feedback-answer.services';
import {
  FeedbackAnswerSchema,
  FeedbackAnswerSchemaClass,
} from './schema/feedback-answer.schema';
import {
  ClassScheduleSchema,
  ClassScheduleSchemaClass,
} from '../classSchedule/schema/class-schedule.schema';
import {
  FeedbackQuestion,
  FeedbackQuestionSchema,
} from '../feedback-Question/schema/feedback-question.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: FeedbackAnswerSchemaClass.name, schema: FeedbackAnswerSchema },
      { name: ClassScheduleSchemaClass.name, schema: ClassScheduleSchema },
      { name: FeedbackQuestion.name, schema: FeedbackQuestionSchema },
    ]),
  ],
  controllers: [FeedbackAnswerController],
  providers: [FeedbackAnswerService],
  exports: [FeedbackAnswerService],
})
export class FeedbackAnswerModule {}
