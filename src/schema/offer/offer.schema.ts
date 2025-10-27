// offer.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type OfferDocument = Offer & Document;

@Schema({ timestamps: true })
export class Offer {
  @Prop({ required: true })
  title: string;

  @Prop()
  description?: string;

  @Prop({ enum: ['Course', 'User', 'Bundle'], required: true })
  type: string;

  @Prop({ default: 0 })
  discountPercent: number;

  @Prop({ type: [Types.ObjectId], ref: 'Course', default: [] })
  applicableCourses: Types.ObjectId[];

  @Prop()
  expiryDate?: Date;

  @Prop({ default: true })
  isActive: boolean;
}

export const OfferSchema = SchemaFactory.createForClass(Offer);
