import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { FeedbackQuestion } from '../../feedback-Question/schema/feedback-question.schema';
import { Types } from 'mongoose';
import { UserSchemaClass } from '../../users/schema/user.schema';
import { CourseSchemaClass } from '../../course/schema/course.schema';
import { EntityDocumentHelper } from '../../utils/document-entity-helper';

@Schema({ timestamps: true })
export class FeedbackAnswerSchemaClass extends EntityDocumentHelper {
  @Prop({
    type: Types.ObjectId,
    ref: UserSchemaClass.name,
  })
  userId: Types.ObjectId;

  @Prop({
    type: Types.ObjectId,
    ref: CourseSchemaClass.name,
  })
  courseId: Types.ObjectId;

  @Prop({
    type: [
      {
        questionId: {
          type: Types.ObjectId,
          ref: FeedbackQuestion.name,
          required: true,
        },
        answer: {
          type: String,
          required: true,
        },
        type: {
          type: String,
          required: true,
        },
      },
    ],
  })
  answers: {
    questionId: Types.ObjectId;
    answer: any;
    type: string;
  }[];

  @Prop({
    type: Boolean,
    default: false,
  })
  isCompleted: boolean;

  @Prop({
    type: Boolean,
    default: false,
  })
  isClassFinished: boolean;
}

export const FeedbackAnswerSchema = SchemaFactory.createForClass(
  FeedbackAnswerSchemaClass,
);
