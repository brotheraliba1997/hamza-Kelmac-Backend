// corporate.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type CorporateDocument = Corporate & Document;

@Schema({ timestamps: true })
export class Corporate {
  @Prop({ required: true })
  companyName: string;

  @Prop({ type: [Types.ObjectId], ref: 'User', default: [] })
  employees: Types.ObjectId[];

  @Prop({ type: [Types.ObjectId], ref: 'Course', default: [] })
  enrolledCourses: Types.ObjectId[];

  @Prop({ default: 'USD' })
  currency: string;

  @Prop({ default: 1 })
  regionalMultiplier: number; // for regional pricing
}

export const CorporateSchema = SchemaFactory.createForClass(Corporate);
