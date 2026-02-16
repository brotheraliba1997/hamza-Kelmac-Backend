import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { EntityDocumentHelper } from '../../utils/document-entity-helper';
import { CourseSchemaClass } from '../../course/schema/course.schema';
import { UserSchemaClass } from '../../users/schema/user.schema';
import { ClassScheduleSchemaClass } from '../../classSchedule/schema/class-schedule.schema';

export type PassFailRecordDocument =
  HydratedDocument<AssigmentPassFailRecordSchemaClass>;

export enum PassFailStatusEnum {
  PASS = 'PASS',
  FAIL = 'FAIL',
}

@Schema({
  timestamps: true,
  toJSON: { virtuals: true, getters: true },
})
export class AssigmentPassFailRecordSchemaClass extends EntityDocumentHelper {
  @Prop({
    type: Types.ObjectId,
    ref: UserSchemaClass.name,
    required: true,
    index: true,
    description: 'Student ID',
  })
  studentId: Types.ObjectId;

  @Prop({
    type: Types.ObjectId,
    ref: CourseSchemaClass.name,
    required: true,
    index: true,
    description: 'Course ID',
  })
  courseId: Types.ObjectId;

  @Prop({
    type: Types.ObjectId,
    required: true,
    index: true,
    description: 'Session ID from course.sessions array',
  })
  sessionId: Types.ObjectId;

  @Prop({
    type: Types.ObjectId,
    ref: ClassScheduleSchemaClass.name,
    required: false,
    index: true,
    description: 'Class Schedule ID (optional - for specific class pass/fail)',
  })
  classScheduleId?: Types.ObjectId;

  @Prop({
    type: String,
    enum: Object.values(PassFailStatusEnum),
    required: true,
    description: 'Pass or Fail status',
  })
  status: PassFailStatusEnum;

  @Prop({
    type: Number,
    required: true,
    description: 'Total number of classes',
  })
  totalClasses: number;

  @Prop({
    type: Number,
    required: true,
    default: 0,
    description: 'Number of present attendance records',
  })
  presentCount: number;

  @Prop({
    type: Number,
    required: true,
    default: 0,
    description: 'Number of absent attendance records',
  })
  absentCount: number;

  @Prop({
    type: Number,
    required: true,
    default: 0,
    description: 'Attendance percentage',
  })
  attendancePercentage: number;

  @Prop({
    type: Boolean,
    default: false,
    index: true,
    description: 'Whether operator has approved this pass/fail status',
  })
  isApproved: boolean;

  @Prop({
    type: Types.ObjectId,
    ref: UserSchemaClass.name,
    required: false,
    description: 'Operator who approved the status',
  })
  approvedBy?: Types.ObjectId;

  @Prop({
    type: Date,
    required: false,
    description: 'Timestamp when status was approved',
  })
  approvedAt?: Date;

  @Prop({
    type: Boolean,
    default: false,
    index: true,
    description: 'Whether certificate has been issued',
  })
  certificateIssued: boolean;

  @Prop({
    type: Types.ObjectId,
    required: false,
    description: 'Certificate ID if certificate has been issued',
  })
  certificateId?: Types.ObjectId;

  @Prop({
    type: String,
    required: false,
    description: 'Certificate URL (PDF or link)',
  })
  certificateUrl?: string;

  @Prop({
    type: String,
    trim: true,
    required: false,
    description: 'Optional notes or remarks',
  })
  notes?: string;

  @Prop({
    type: Date,
    default: () => new Date(),
    description: 'Timestamp when pass/fail was determined',
  })
  determinedAt: Date;
}

export const PassFailRecordSchema = SchemaFactory.createForClass(
  AssigmentPassFailRecordSchemaClass,
);

// Indexes for performance
PassFailRecordSchema.index(
  { studentId: 1, courseId: 1, sessionId: 1 },
  { unique: true },
);
PassFailRecordSchema.index({ courseId: 1, sessionId: 1 });
PassFailRecordSchema.index({ studentId: 1 });
PassFailRecordSchema.index({ status: 1 });
PassFailRecordSchema.index({ isApproved: 1 });
PassFailRecordSchema.index({ certificateIssued: 1 });
PassFailRecordSchema.index({ determinedAt: -1 });
