import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { now, HydratedDocument, Types } from 'mongoose';
import { EntityDocumentHelper } from '../../utils/document-entity-helper';
import { CourseSchemaClass } from '../../course/schema/course.schema';
import { UserSchemaClass } from '../../users/schema/user.schema';

export type ClassScheduleSchemaDocument =
  HydratedDocument<ClassScheduleSchemaClass>;

@Schema({
  timestamps: true,
  toJSON: {
    virtuals: true,
    getters: true,
  },
})
export class ClassScheduleSchemaClass extends EntityDocumentHelper {
  @Prop({
    type: Types.ObjectId,
    ref: CourseSchemaClass.name,
    required: true,
  })
  course: Types.ObjectId;

  @Prop({
    type: Types.ObjectId,
    ref: UserSchemaClass.name,
    required: true,
  })
  instructor: Types.ObjectId;

  @Prop({
    type: [{ type: Types.ObjectId, ref: UserSchemaClass.name }],
    default: [],
  })
  students: string[];

  // @Prop({
  //   type: String,
  //   required: true,
  // })
  // students?: string;

  @Prop({
    type: String,
    required: true,
    description: 'Date of the class (YYYY-MM-DD)',
  })
  date: string;

  @Prop({
    type: String,
    required: true,
    description: 'Time of the class (HH:mm in 24-hour format)',
  })
  time: string;

  @Prop({
    type: Number,
    min: 1,
    description: 'Duration of the class in minutes',
  })
  duration: number;

  @Prop({
    type: String,
    required: false,
    description: 'Google Meet link for the scheduled class',
  })
  googleMeetLink?: string;

  @Prop({
    type: String,
    required: false,
    unique: true,
    description: 'Security key used for class access validation',
  })
  securityKey?: string;

  @Prop({
    type: String,
    enum: ['scheduled', 'ongoing', 'completed', 'cancelled'],
    default: 'scheduled',
  })
  status: 'scheduled' | 'ongoing' | 'completed' | 'cancelled';

  @Prop({
    type: Number,
    default: 0,
    min: 0,
    max: 100,
    description: 'Average progress or attendance percentage of this class',
  })
  progress: number;

  @Prop({
    type: Date,
    description: 'Timestamp when the class started',
  })
  startedAt?: Date;

  @Prop({
    type: Date,
    description: 'Timestamp when the class ended',
  })
  endedAt?: Date;

  @Prop({
    type: String,
    description: 'Google Calendar event link',
  })
  googleCalendarEventLink?: string;

  @Prop({ default: now })
  createdAt: Date;

  @Prop({ default: now })
  updatedAt: Date;

  @Prop()
  deletedAt?: Date | null;
}

export const ClassScheduleSchema = SchemaFactory.createForClass(
  ClassScheduleSchemaClass,
);

// ✅ Indexes for performance and query optimization
ClassScheduleSchema.index({ course: 1 });
ClassScheduleSchema.index({ instructor: 1 });
ClassScheduleSchema.index({ date: 1, time: 1 });
ClassScheduleSchema.index({ status: 1 });
ClassScheduleSchema.index({ createdAt: -1 });
