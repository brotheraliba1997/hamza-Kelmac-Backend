import {
  IsNotEmpty,
  IsString,
  IsOptional,
  IsNumber,
  Min,
  IsMongoId,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CorporateCreatePaymentDto {
  @ApiPropertyOptional({
    description: 'Custom amount (if different from course price)',
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  amount?: number;

  @ApiPropertyOptional({ description: 'Currency code', default: 'usd' })
  @IsOptional()
  @IsString()
  currency?: string;

  @ApiPropertyOptional({ description: 'Additional metadata' })
  @IsOptional()
  metadata?: Record<string, any>;
}
