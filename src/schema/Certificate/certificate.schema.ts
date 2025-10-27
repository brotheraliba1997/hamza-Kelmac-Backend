// certificate.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type CertificateDocument = Certificate & Document;

@Schema({ timestamps: true })
export class Certificate {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  user: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Course', required: true })
  course: Types.ObjectId;

  @Prop({ required: true })
  certificateUrl: string; // PDF or link
}

export const CertificateSchema = SchemaFactory.createForClass(Certificate);
