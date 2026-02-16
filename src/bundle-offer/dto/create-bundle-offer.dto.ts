import {
  IsNotEmpty,
  IsString,
  IsArray,
  IsMongoId,
  IsNumber,
  IsBoolean,
  IsOptional,
  IsDateString,
  Min,
  ArrayMinSize,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
export class CreateBundleOfferDto {
  @ApiProperty({
    description: 'Bundle title',
    example: 'Quality Management Bundle',
  })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({
    description: 'Bundle description',
    example: 'Get all quality courses at discounted price',
    required: false,
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({
    description: 'Array of course IDs included in the bundle',
    type: [String],
    example: ['507f1f77bcf86cd799439011', '507f1f77bcf86cd799439012'],
  })
  @IsArray()
  @ArrayMinSize(1, { message: 'At least one course is required' })
  @IsMongoId({ each: true })
  @IsNotEmpty()
  courses: string[];

  @ApiProperty({
    description: 'Sum of original course prices',
    example: 299,
  })
  @IsNumber()
  @Min(0)
  originalPrice: number;

  @ApiProperty({
    description: 'Discounted bundle price',
    example: 199,
  })
  @IsNumber()
  @Min(0)
  bundlePrice: number;

  @ApiProperty({
    description: 'Whether bundle is active',
    example: true,
    required: false,
  })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @ApiProperty({
    description: 'Optional expiration date (ISO 8601)',
    example: '2025-12-31T23:59:59.000Z',
    required: false,
  })
  @IsDateString()
  @IsOptional()
  expiresAt?: string;
}
