import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { now, HydratedDocument, Types } from 'mongoose';
import { EntityDocumentHelper } from '../../../../../utils/document-entity-helper';

export type CertificateSchemaDocument =
  HydratedDocument<CertificateSchemaClass>;

@Schema({
  timestamps: true,
  toJSON: {
    virtuals: true,
    getters: true,
  },
})
export class CertificateSchemaClass extends EntityDocumentHelper {
  @Prop({
    type: Types.ObjectId,
    ref: 'User',
    required: true,
  })
  user: Types.ObjectId;

  @Prop({
    type: Types.ObjectId,
    ref: 'Course',
    required: true,
  })
  course: Types.ObjectId;

  @Prop({
    type: String,
    required: true,
  })
  certificateUrl: string; // PDF or link

  @Prop({ default: now })
  createdAt: Date;

  @Prop({ default: now })
  updatedAt: Date;

  @Prop()
  deletedAt: Date;
}

export const CertificateSchema = SchemaFactory.createForClass(
  CertificateSchemaClass,
);

// Add indexes for frequently queried fields
CertificateSchema.index({ user: 1 });
CertificateSchema.index({ course: 1 });
CertificateSchema.index({ createdAt: -1 });
