import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { now, HydratedDocument, Types } from 'mongoose';
import { EntityDocumentHelper } from '../../utils/document-entity-helper';
import { UserSchemaClass } from '../../users/schema/user.schema';
import { CourseSchemaClass } from '../../course/schema/course.schema';

import { CertificateSchemaClass } from '../../certificate/schema/certificate.schema';
import { Payment } from '../../payment/schema/payment.schema';

export type EnrollmentSchemaDocument = HydratedDocument<EnrollmentSchemaClass>;

@Schema({
  timestamps: true,
  toJSON: {
    virtuals: true,
    getters: true,
  },
})
export class EnrollmentSchemaClass extends EntityDocumentHelper {
  @Prop({ type: Types.ObjectId, ref: UserSchemaClass.name, required: true })
  user: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: CourseSchemaClass.name, required: true })
  course: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: Payment.name })
  payment?: Types.ObjectId;

  // @Prop({ type: Types.ObjectId, ref: Offer.name })
  // offer?: Types.ObjectId;

  @Prop({ default: 0, min: 0, max: 100 })
  progress: number;

  @Prop({
    type: String,
    enum: ['active', 'completed', 'cancelled'],
    default: 'active',
  })
  status: string;

  @Prop({ type: Date })
  completionDate?: Date;

  @Prop({ type: Types.ObjectId, ref: CertificateSchemaClass.name })
  certificate?: Types.ObjectId;

  @Prop({ default: now })
  createdAt: Date;

  @Prop({ default: now })
  updatedAt: Date;

  @Prop()
  deletedAt?: Date;
}

export const EnrollmentSchema = SchemaFactory.createForClass(
  EnrollmentSchemaClass,
);

// Useful indexes for queries and constraints
EnrollmentSchema.index({ user: 1 });
EnrollmentSchema.index({ course: 1 });
EnrollmentSchema.index({ status: 1 });
EnrollmentSchema.index({ user: 1, course: 1 }, { unique: true });
