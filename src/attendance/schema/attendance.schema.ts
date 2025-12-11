import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { EntityDocumentHelper } from '../../utils/document-entity-helper';
import { CourseSchemaClass } from '../../course/schema/course.schema';
import { UserSchemaClass } from '../../users/schema/user.schema';
import { ClassScheduleSchemaClass } from '../../classSchedule/schema/class-schedule.schema';

export type AttendanceDocument = HydratedDocument<AttendanceSchemaClass>;

export enum AttendanceStatusEnum {
  PRESENT = 'present',
  ABSENT = 'absent',

}

@Schema({
  timestamps: true,
  toJSON: { virtuals: true, getters: true },
})
export class AttendanceSchemaClass extends EntityDocumentHelper {



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
    description: 'Course ID - sessions array is inside course',
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
    description: 'Instructor who marked the attendance',
  })
  markedBy: Types.ObjectId;

  @Prop({
    type: String,
    enum: Object.values(AttendanceStatusEnum),
    default: AttendanceStatusEnum.ABSENT,
    required: true,
  })
  status: AttendanceStatusEnum;

  @Prop({
    type: String,
    trim: true,
    description: 'Optional notes or remarks about attendance',
  })
  notes?: string;

  @Prop({
    type: Date,
    default: () => new Date(),
    description: 'Timestamp when attendance was marked',
  })
  markedAt: Date;
}

export const AttendanceSchema = SchemaFactory.createForClass(
  AttendanceSchemaClass,
);

// Indexes for performance
// Allow multiple attendance records per student/classSchedule (no unique constraint)
AttendanceSchema.index({ classScheduleId: 1, student: 1 });
AttendanceSchema.index({ classScheduleId: 1 });
AttendanceSchema.index({ courseId: 1 });
AttendanceSchema.index({ student: 1 });
AttendanceSchema.index({ markedBy: 1 });
AttendanceSchema.index({ status: 1 });
AttendanceSchema.index({ markedAt: -1 });

