import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { ApiProperty } from '@nestjs/swagger';
import { UserSchemaClass } from '../../users/schema/user.schema';
import { CourseSchemaClass } from '../../course/schema/course.schema';
import { Payment } from '../../payment/schema/payment.schema';
// import { Payment } from 'src/payment/schemas/payment.schema';
// import { Course } from 'src/course/schemas/course.schema';
// import { User } from 'src/user/schemas/user.schema';
// import { ClassSchedule } from 'src/class-schedule/schemas/class-schedule.schema';

export type BookingDocument = Booking & Document;

export enum BookingStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  CANCELLED = 'cancelled',
}

@Schema({ timestamps: true })
export class Booking {
  @ApiProperty({ description: 'Student who booked the course' })
  @Prop({ type: Types.ObjectId,   ref: UserSchemaClass.name, required: true })
  studentId: Types.ObjectId;

  @ApiProperty({ description: 'Course being booked' })
  @Prop({ type: Types.ObjectId, ref: CourseSchemaClass.name, required: true })
  courseId: Types.ObjectId;

  @ApiProperty({ description: 'Selected class schedule or timetable' })
  @Prop({ type: Types.ObjectId, ref: CourseSchemaClass.name, required: true })
  timeTableId: Types.ObjectId;

 

  @ApiProperty({ enum: BookingStatus, default: BookingStatus.PENDING })
  @Prop({
    type: String,
    enum: BookingStatus,
    default: BookingStatus.PENDING,
  })
  status: BookingStatus;

  @ApiProperty({ description: 'Optional notes or remarks' })
  @Prop()
  notes?: string;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}

export const BookingSchema = SchemaFactory.createForClass(Booking);

// Indexes for faster queries
BookingSchema.index({ studentId: 1, courseId: 1 });
BookingSchema.index({ status: 1, createdAt: -1 });
