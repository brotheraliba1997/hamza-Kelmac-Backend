import { ApiProperty } from '@nestjs/swagger';
import { PurchaseOrderStatusEnum } from '../schema/purchase.schema';

export class PurchaseOrderEntity {
  @ApiProperty({ example: '675f4aaf2b67a23d4c9f2941' })
  id: string;

  @ApiProperty({ example: 'PO-2025-00045' })
  poNumber: string;

  @ApiProperty({
    description: 'Student user ID associated with the order',
    example: '675f4aaf2b67a23d4c9f2941',
  })
  student: string;

  @ApiProperty({
    description: 'Course ID linked to this purchase order',
    example: '675f4aaf2b67a23d4c9f2941',
  })
  course: string;

  @ApiProperty({
    description: 'Finance reviewer/contact user ID',
    example: '6841ca06ebdfea1c5e6a0e73',
  })
  financialContact: string;

  @ApiProperty({
    description: 'Bank slip / proof of payment location',
    example: 'https://cdn.kelmac.com/uploads/bank-slips/PO-2025-00045.png',
  })
  bankSlipUrl: string;

  @ApiProperty({
    enum: PurchaseOrderStatusEnum,
    example: PurchaseOrderStatusEnum.PENDING,
  })
  status: PurchaseOrderStatusEnum;

  @ApiProperty({
    description: 'Date the purchase order was submitted',
    example: '2025-02-18T10:30:00.000Z',
  })
  submittedAt: Date;

  @ApiProperty({
    description: 'Finance reviewer ID',
    example: '675f4aaf2b67a23d4c9f2941',
    required: false,
  })
  reviewedBy?: string;

  @ApiProperty({
    description: 'Timestamp when PO was reviewed',
    example: '2025-02-19T09:15:00.000Z',
    required: false,
  })
  reviewedAt?: Date;

  @ApiProperty({
    description: 'Finance notes or instructions',
    example: 'Payment verified via bank statement',
    required: false,
  })
  decisionNotes?: string;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  constructor(partial: Partial<PurchaseOrderEntity>) {
    Object.assign(this, partial);
  }
}
