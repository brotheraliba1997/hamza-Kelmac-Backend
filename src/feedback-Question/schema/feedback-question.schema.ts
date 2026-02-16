import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';
import { CourseSchemaClass } from '../../course/schema/course.schema';
import { Types } from 'mongoose';
import { EntityDocumentHelper } from '../../utils/document-entity-helper';

@Schema({ timestamps: true })
export class FeedbackQuestion extends EntityDocumentHelper {
  @ApiProperty()
  @Prop({
    type: Types.ObjectId,
    ref: CourseSchemaClass.name,
    required: false,
  })
  courseId: Types.ObjectId;

  @ApiProperty()
  @Prop({
    type: String,
    required: true,
  })
  question: string;

  @ApiProperty()
  @Prop({
    type: String,
    required: true,
  })
  title: string;

  @Prop({
    type: [String],
    required: false,
    default: [],
  })
  options: string[];

  @ApiProperty()
  @Prop({
    type: String,
    required: true,
  })
  type: string;

  @ApiProperty()
  @Prop({
    type: Boolean,
    required: true,
  })
  status: boolean;
}

export const FeedbackQuestionSchema =
  SchemaFactory.createForClass(FeedbackQuestion);
