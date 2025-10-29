import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsMongoId, IsOptional } from 'class-validator';

export class CreateEnrollmentDto {
  @ApiProperty({
    description: 'The MongoDB ID of the user',
    example: '507f1f77bcf86cd799439011',
  })
  @IsMongoId()
  user: string;

  @ApiProperty({
    description: 'The MongoDB ID of the course',
    example: '507f1f77bcf86cd799439012',
  })
  @IsMongoId()
  course: string;

  @ApiPropertyOptional({
    description: 'The MongoDB ID of the payment',
    example: '507f1f77bcf86cd799439013',
  })
  @IsOptional()
  @IsMongoId()
  payment?: string;

  @ApiPropertyOptional({
    description: 'The MongoDB ID of the offer applied',
    example: '507f1f77bcf86cd799439014',
  })
  @IsOptional()
  @IsMongoId()
  offer?: string;

  @ApiPropertyOptional({
    description: 'The status of the enrollment',
    enum: ['active', 'completed', 'cancelled'],
    default: 'active',
    example: 'active',
  })
  @IsEnum(['active', 'completed', 'cancelled'])
  @IsOptional()
  status?: string;
}
