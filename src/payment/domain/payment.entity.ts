import { ApiProperty } from '@nestjs/swagger';
import { PaymentStatus, PaymentMethod } from '../schema/payment.schema';

export class PaymentEntity {
  @ApiProperty()
  id: string;

  @ApiProperty()
  userId: string;

  @ApiProperty()
  courseId: string;

  @ApiProperty()
  enrollment?: string;

  @ApiProperty()
  amount: number;

  @ApiProperty()
  currency: string;

  @ApiProperty({ enum: PaymentStatus })
  status: PaymentStatus;

  @ApiProperty({ enum: PaymentMethod })
  paymentMethod: PaymentMethod;

  @ApiProperty()
  stripePaymentIntentId?: string;

  @ApiProperty()
  stripeCustomerId?: string;

  @ApiProperty()
  purchaseOrderId?: string;

  @ApiProperty()
  BookingId?: string;

  @ApiProperty()
  stripeChargeId?: string;

  @ApiProperty()
  receiptUrl?: string;

  @ApiProperty()
  description?: string;

  @ApiProperty()
  metadata?: Record<string, any>;

  @ApiProperty()
  failureReason?: string;

  @ApiProperty()
  refundedAmount?: number;

  @ApiProperty()
  refundedAt?: Date;

  @ApiProperty()
  paidAt?: Date;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}
