import { PartialType } from '@nestjs/mapped-types';
import { CreatePurchaseOrderDto } from './create-purchase.dto';
import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsDateString,
  IsEnum,
  IsMongoId,
  IsOptional,
  IsString,
} from 'class-validator';
import { PurchaseOrderStatusEnum } from '../schema/purchase.schema';

export class UpdatePurchaseOrderDto extends PartialType(
  CreatePurchaseOrderDto,
) {
  @ApiPropertyOptional({
    enum: PurchaseOrderStatusEnum,
    description: 'Finance decision on the purchase order',
    example: PurchaseOrderStatusEnum.APPROVED,
  })
  @IsOptional()
  @IsEnum(PurchaseOrderStatusEnum)
  status?: PurchaseOrderStatusEnum;

  @ApiPropertyOptional({
    description: 'Finance reviewer user ID',
    example: '675f4aaf2b67a23d4c9f2941',
  })
  @IsOptional()
  @IsMongoId()
  reviewedBy?: string;

  @ApiPropertyOptional({
    description: 'Timestamp when finance completed the review',
    example: '2025-02-18T12:15:00.000Z',
  })
  @IsOptional()
  @IsDateString()
  reviewedAt?: string;

  @ApiPropertyOptional({
    description: 'Finance team comments/instructions',
    example: 'Payment verified via bank statement',
  })
  @IsOptional()
  @IsString()
  decisionNotes?: string;
}
