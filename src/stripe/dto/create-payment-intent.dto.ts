import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsString, IsOptional, Min } from 'class-validator';

export class CreatePaymentIntentDto {
  @ApiProperty({
    example: 5000,
    description: 'Amount in cents (e.g., 5000 = $50.00)',
  })
  @IsNumber()
  @Min(1)
  amount: number;

  @ApiProperty({
    example: 'usd',
    description: 'Currency code (e.g., usd, eur)',
    default: 'usd',
  })
  @IsString()
  @IsOptional()
  currency?: string;

  @ApiProperty({
    example: '671018fabc123456789ef013',
    description: 'Course ID for the payment',
  })
  @IsString()
  courseId: string;

  @ApiProperty({
    example: '671018fabc123456789ef014',
    description: 'User ID making the payment',
  })
  @IsString()
  userId: string;

  @ApiProperty({
    example: 'Course enrollment payment',
    description: 'Description of the payment',
    required: false,
  })
  @IsString()
  @IsOptional()
  description?: string;
}
