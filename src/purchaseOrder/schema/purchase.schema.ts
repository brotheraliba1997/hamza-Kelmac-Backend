import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Schema as MongooseSchema, Types } from 'mongoose';
import { EntityDocumentHelper } from '../../utils/document-entity-helper';
import { CourseSchemaClass } from '../../course/schema/course.schema';
import { UserSchemaClass } from '../../users/schema/user.schema';
import { ApiProperty } from '@nestjs/swagger';

export type PurchaseOrderDocument =
  HydratedDocument<PurchaseOrderSchemaClass>;

export enum PurchaseOrderStatusEnum {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  NEEDS_INFO = 'needs_info',
}

@Schema({
  timestamps: true,
  toJSON: { virtuals: true, getters: true },
})
export class PurchaseOrderSchemaClass extends EntityDocumentHelper {
  @Prop({ type: String, required: true, unique: true, trim: true })
  poNumber: string;

  @Prop({
    type: Types.ObjectId,
    ref: UserSchemaClass.name,
    required: true,
    index: true,
  })
  student: Types.ObjectId;

  @Prop({
    type: Types.ObjectId,
    ref: CourseSchemaClass.name,
    required: true,
    index: true,
  })
  course: Types.ObjectId;

  @Prop({
    type: Types.ObjectId,
    ref: UserSchemaClass.name,
    required: true,
  })
  financialContact: Types.ObjectId;

  @Prop({ type: String, required: true })
  bankSlipUrl: string;

  @Prop({
    type: String,
    enum: Object.values(PurchaseOrderStatusEnum),
    default: PurchaseOrderStatusEnum.PENDING,
    index: true,
  })
  status: PurchaseOrderStatusEnum;


  
  @ApiProperty()
  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: 'Booking',
    sparse: true,
  })
  BookingId?: MongooseSchema.Types.ObjectId;

  @Prop({ type: Date, default: () => new Date(), index: true })
  submittedAt: Date;

  @Prop({
    type: Types.ObjectId,
    ref: UserSchemaClass.name,
  })
  reviewedBy?: Types.ObjectId;

  @Prop({ type: Date })
  reviewedAt?: Date;

  @Prop({ type: String, trim: true })
  decisionNotes?: string;
}

export const PurchaseOrderSchema =
  SchemaFactory.createForClass(PurchaseOrderSchemaClass);

PurchaseOrderSchema.index({ poNumber: 1 }, { unique: true });
PurchaseOrderSchema.index({ status: 1, submittedAt: -1 });

