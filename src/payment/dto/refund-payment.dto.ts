import {
  IsNotEmpty,
  IsString,
  IsOptional,
  IsNumber,
  Min,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class RefundPaymentDto {
  @ApiProperty({ description: 'Payment ID to refund' })
  @IsNotEmpty()
  @IsString()
  paymentId: string;

  @ApiPropertyOptional({ description: 'Amount to refund (partial refund)' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  amount?: number;

  @ApiPropertyOptional({ description: 'Reason for refund' })
  @IsOptional()
  @IsString()
  reason?: string;
}
