import { IsNotEmpty, IsString, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateCheckoutDto {
  @ApiProperty({ description: 'Course ID to purchase' })
  @IsNotEmpty()
  @IsString()
  courseId: string;

  @ApiProperty({ description: 'Success redirect URL' })
  @IsNotEmpty()
  @IsString()
  successUrl: string;

  @ApiProperty({ description: 'Cancel redirect URL' })
  @IsNotEmpty()
  @IsString()
  cancelUrl: string;

  @ApiPropertyOptional({ description: 'Additional metadata' })
  @IsOptional()
  metadata?: Record<string, any>;
}
