// enrollment.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type EnrollmentDocument = Enrollment & Document;

@Schema({ timestamps: true })
export class Enrollment {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  user: Types.ObjectId; // Student or Corporate User

  @Prop({ type: Types.ObjectId, ref: 'Course', required: true })
  course: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Payment' })
  payment?: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Offer' })
  offer?: Types.ObjectId;

  @Prop({ default: 0 })
  progress: number; // percentage (0-100)

  @Prop({ enum: ['active', 'completed', 'cancelled'], default: 'active' })
  status: string;

  @Prop()
  completionDate?: Date;

  @Prop({ type: Types.ObjectId, ref: 'Certificate' })
  certificate?: Types.ObjectId; // link to certificate when completed
}

export const EnrollmentSchema = SchemaFactory.createForClass(Enrollment);
