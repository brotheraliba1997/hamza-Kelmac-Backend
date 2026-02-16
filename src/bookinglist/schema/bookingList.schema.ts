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

export type BookingListDocument = BookingList & Document;

export enum BookingStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  CANCELLED = 'cancelled',
}

export enum PaymentMethod {
  STRIPE = 'stripe',
  PURCHASEORDER = 'purchase_order',
}

@Schema({ timestamps: true })
export class BookingList {
  @ApiProperty({
    description: 'Students who booked (array - for corporate bookings)',
  })
  @Prop({
    type: [{ type: Types.ObjectId, ref: UserSchemaClass.name }],
    default: [],
  })
  studentIds: Types.ObjectId[];

  @ApiProperty({ description: 'Course being booked' })
  @Prop({ type: Types.ObjectId, ref: CourseSchemaClass.name, required: true })
  courseId: Types.ObjectId;

  @ApiProperty({ description: 'Selected class schedule or timetable' })
  @Prop({ type: Types.ObjectId, ref: CourseSchemaClass.name, required: true })
  sessionId: Types.ObjectId;

  @ApiProperty({ enum: PaymentMethod, default: PaymentMethod.STRIPE })
  @Prop({
    type: String,
    enum: PaymentMethod,
    default: PaymentMethod.STRIPE,
  })
  paymentMethod: PaymentMethod;

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

export const BookingListSchema = SchemaFactory.createForClass(BookingList);

// Indexes for faster queries
BookingListSchema.index({ studentId: 1, courseId: 1 });
BookingListSchema.index({ studentIds: 1, courseId: 1 });
BookingListSchema.index({ status: 1, createdAt: -1 });
