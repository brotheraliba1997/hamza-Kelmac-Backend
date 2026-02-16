import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { FeedbackController } from './feedback.controller';
import { FeedbackService } from './feedback.services';
import {
  FeedbackQuestion,
  FeedbackQuestionSchema,
} from './schema/feedback-question.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: FeedbackQuestion.name, schema: FeedbackQuestionSchema },
    ]),
  ],
  controllers: [FeedbackController],
  providers: [FeedbackService],
  exports: [FeedbackService],
})
export class FeedbackModule {}
