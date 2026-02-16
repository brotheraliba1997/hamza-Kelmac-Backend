import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { EntityDocumentHelper } from '../../utils/document-entity-helper';
import { CourseSchemaClass } from '../../course/schema/course.schema';
import { UserSchemaClass } from '../../users/schema/user.schema';
import { ClassScheduleSchemaClass } from '../../classSchedule/schema/class-schedule.schema';

export type AssigmentDocument = HydratedDocument<AssignmentSchemaClass>;

@Schema({
  timestamps: true,
  toJSON: { virtuals: true, getters: true },
})
export class AssignmentSchemaClass extends EntityDocumentHelper {
  @Prop({
    type: Types.ObjectId,
    ref: ClassScheduleSchemaClass.name,
    required: true,
    index: true,
    description: 'Class Schedule ID reference',
  })
  classScheduleId: Types.ObjectId;

  @Prop({
    type: Types.ObjectId,
    ref: CourseSchemaClass.name,
    required: true,
    index: true,
    description: 'Course ID reference',
  })
  courseId: Types.ObjectId;

  @Prop({
    type: Types.ObjectId,
    required: true,
    description: 'Session ID from course.sessions array (ObjectId)',
    index: true,
  })
  sessionId: Types.ObjectId;

  @Prop({
    type: Types.ObjectId,
    ref: UserSchemaClass.name,
    required: true,
    index: true,
  })
  student: Types.ObjectId;

  @Prop({
    type: Types.ObjectId,
    ref: UserSchemaClass.name,
    required: true,
    description: 'Instructor who evaluated the assignment',
  })
  markedBy: Types.ObjectId;

  @Prop({
    type: Number,
    index: true,
    required: true,
    description: 'Marks awarded for the assignment',
  })
  marks: number;

  @Prop({
    type: String,
    trim: true,
    description: 'Certificate PDF URL',
  })
  certificateUrl?: string;
}

export const AssigmentSchema = SchemaFactory.createForClass(
  AssignmentSchemaClass,
);
AssigmentSchema.index({ classScheduleId: 1, student: 1 });
AssigmentSchema.index({ classScheduleId: 1 });
AssigmentSchema.index({ courseId: 1 });
AssigmentSchema.index({ student: 1 });
AssigmentSchema.index({ markedBy: 1 });
AssigmentSchema.index({ marks: 1 });
