import {
  IsNotEmpty,
  IsString,
  IsOptional,
  IsNumber,
  Min,
  IsMongoId,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreatePaymentDto {
  @ApiProperty({ description: 'Course ID to purchase' })
  @IsNotEmpty()
  @IsString()
  courseId: string;

  @ApiProperty({ description: 'user ID to purchase' })
  @IsNotEmpty()
  @IsString()
  userId: string;

  @ApiPropertyOptional({ description: 'Booking ID reference' })
  @IsOptional()
  @IsMongoId()
  BookingId?: string;

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
