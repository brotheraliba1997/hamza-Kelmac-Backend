import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { now, HydratedDocument, Types } from 'mongoose';
import { EntityDocumentHelper } from '../../../../../utils/document-entity-helper';

export type EnrollmentSchemaDocument = HydratedDocument<EnrollmentSchemaClass>;

@Schema({
  timestamps: true,
  toJSON: {
    virtuals: true,
    getters: true,
  },
})
export class EnrollmentSchemaClass extends EntityDocumentHelper {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  user: Types.ObjectId; // Student or Corporate User

  @Prop({ type: Types.ObjectId, ref: 'Course', required: true })
  course: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Payment' })
  payment?: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Offer' })
  offer?: Types.ObjectId;

  @Prop({ default: 0, min: 0, max: 100 })
  progress: number; // percentage (0-100)

  @Prop({
    type: String,
    enum: ['active', 'completed', 'cancelled'],
    default: 'active',
  })
  status: string;

  @Prop({ type: Date })
  completionDate?: Date;

  @Prop({ type: Types.ObjectId, ref: 'Certificate' })
  certificate?: Types.ObjectId;

  @Prop({ default: now })
  createdAt: Date;

  @Prop({ default: now })
  updatedAt: Date;

  @Prop()
  deletedAt: Date;
}

export const EnrollmentSchema = SchemaFactory.createForClass(
  EnrollmentSchemaClass,
);

// Add indexes for frequently queried fields
EnrollmentSchema.index({ user: 1 });
EnrollmentSchema.index({ course: 1 });
EnrollmentSchema.index({ status: 1 });
