import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber, IsOptional } from 'class-validator';

export class CreateCheckoutSessionDto {
  @ApiProperty({
    example: '671018fabc123456789ef013',
    description: 'Course ID to purchase',
  })
  @IsString()
  courseId: string;

  @ApiProperty({
    example: '671018fabc123456789ef014',
    description: 'User ID making the purchase',
  })
  @IsString()
  userId: string;

  @ApiProperty({
    example: 'http://localhost:3000/success',
    description: 'Success redirect URL',
  })
  @IsString()
  successUrl: string;

  @ApiProperty({
    example: 'http://localhost:3000/cancel',
    description: 'Cancel redirect URL',
  })
  @IsString()
  cancelUrl: string;

  @ApiProperty({
    example: 5000,
    description:
      'Price in cents (optional, will use course price if not provided)',
    required: false,
  })
  @IsNumber()
  @IsOptional()
  priceInCents?: number;
}
