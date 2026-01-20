import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { CourseSchemaClass } from '../../course/schema/course.schema';

@Schema({ timestamps: true })
export class AssessmentItem extends Document {
    
  @Prop({
    type: Types.ObjectId,
    ref: CourseSchemaClass.name,
    required: true,
    index: true,
    description: 'Course ID - sessions array is inside course',
  })
  courseId: Types.ObjectId;

  @Prop({ type: String, required: true })
  day: string; // Example: "Day 1"

  @Prop({ type: String, required: true })
  topicRef: string; // Example: "1.1.2"

  @Prop({ type: String, required: true })
  title: string; // Example: "ISO 19011 Terminology..."

  @Prop({ type: String, required: true })
  cu: string; 
  
  @Prop({ type: Number, required: true })
  maxMarks: string; // Example: "AU" or "AU-TL"
}

export const AssessmentItemSchema =
  SchemaFactory.createForClass(AssessmentItem);
