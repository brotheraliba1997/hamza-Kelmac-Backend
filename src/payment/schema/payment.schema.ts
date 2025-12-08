import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema, Types } from 'mongoose';
import { ApiProperty } from '@nestjs/swagger';
import { UserSchemaClass } from '../../users/schema/user.schema';
import { CourseSchemaClass } from '../../course/schema/course.schema';


export type PaymentDocument = Payment & Document;

export enum PaymentStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  SUCCEEDED = 'succeeded',
  FAILED = 'failed',
  CANCELLED = 'cancelled',
  REFUNDED = 'refunded',
}

export enum PaymentMethod {
  STRIPE = 'stripe',
  PAYPAL = 'paypal',
  CREDIT_CARD = 'credit_card',
  PURCHASE_ORDER = 'purchase_order',
}

@Schema({ timestamps: true })
export class Payment {
  @ApiProperty()
  @Prop({
    type: Types.ObjectId,
    ref: UserSchemaClass.name,
    required: true,
  })
  userId: Types.ObjectId;

  @ApiProperty()
  @Prop({
    type: Types.ObjectId,
     ref: CourseSchemaClass.name,
    required: true,
  })
  courseId: Types.ObjectId;





  @ApiProperty()
  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: 'Enrollment',
  })
  enrollment?: MongooseSchema.Types.ObjectId;

  @ApiProperty()
  @Prop({ required: true })
  amount: number;

  @ApiProperty()
  @Prop({ required: true, default: 'usd' })
  currency: string;

  @ApiProperty({ enum: PaymentStatus })
  @Prop({
    type: String,
    enum: PaymentStatus,
    default: PaymentStatus.PENDING,
    index: true,
  })
  status: PaymentStatus;

  @ApiProperty({ enum: PaymentMethod })
  @Prop({
    type: String,
    enum: PaymentMethod,
    required: true,
    default: PaymentMethod.STRIPE,
  })
  paymentMethod: PaymentMethod;

  @ApiProperty()
  @Prop({ unique: true, sparse: true })
  stripePaymentIntentId?: string;

  @ApiProperty()
  @Prop()
  stripeCustomerId?: string;

  @ApiProperty()
  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: 'PurchaseOrder',
    sparse: true,
  })
  purchaseOrderId?: MongooseSchema.Types.ObjectId;



   @ApiProperty()
  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: 'Booking',
    sparse: true,
  })
  BookingId?: MongooseSchema.Types.ObjectId;

  @ApiProperty()
  @Prop()
  stripeChargeId?: string;




  @ApiProperty()
  @Prop()
  receiptUrl?: string;

  @ApiProperty()
  @Prop()
  description?: string;

  @ApiProperty()
  @Prop({ type: Object })
  metadata?: Record<string, any>;

  @ApiProperty()
  @Prop()
  failureReason?: string;

  @ApiProperty()
  @Prop()
  refundedAmount?: number;

  @ApiProperty()
  @Prop()
  refundedAt?: Date;

  @ApiProperty()
  @Prop()
  paidAt?: Date;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}

export const PaymentSchema = SchemaFactory.createForClass(Payment);

// Indexes
PaymentSchema.index({ user: 1, course: 1 });
PaymentSchema.index({ status: 1, createdAt: -1 });
PaymentSchema.index(
  { stripePaymentIntentId: 1 },
  { unique: true, sparse: true },
);
