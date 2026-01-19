// student-item-grade.schema.ts

import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types, Document } from 'mongoose';
import { UserSchemaClass } from '../../users/schema/user.schema';
import { AssignmentSchemaClass } from '../../assigment/schema/assigment.schema';


@Schema({ timestamps: true })
export class StudentItemGrade extends Document {
  @Prop({
    type: Types.ObjectId,
    ref: UserSchemaClass.name,
    required: true,
    index: true,
  })
  studentId: Types.ObjectId;

  @Prop({
    type: Types.ObjectId,
    ref: AssignmentSchemaClass.name,
    required: true,
    index: true,
  })
  assessmentItemId: Types.ObjectId;

  @Prop({
    type: Number,
    required: true,
    min: 0,
  })
  obtainedMarks: number;
}

export const StudentItemGradeSchema =
  SchemaFactory.createForClass(StudentItemGrade);

/**
 * One student can have only ONE grade per assessment item
 */
StudentItemGradeSchema.index(
  { studentId: 1, assessmentItemId: 1 },
  { unique: true },
);
