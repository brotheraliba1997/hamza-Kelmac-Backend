import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsMongoId,
  IsNumber,
  IsOptional,
  IsEnum,
  Min,
  Max,
} from 'class-validator';

export class CreateEnrollmentDto {
  @ApiProperty()
  @IsMongoId()
  user: string;

  @ApiProperty()
  @IsMongoId()
  course: string;

  @ApiPropertyOptional()
  @IsMongoId()
  @IsOptional()
  payment?: string;

  @ApiPropertyOptional()
  @IsMongoId()
  @IsOptional()
  offer?: string;

  @ApiPropertyOptional({ default: 0 })
  @IsNumber()
  @Min(0)
  @Max(100)
  @IsOptional()
  progress?: number;

  @ApiPropertyOptional({
    enum: ['active', 'completed', 'cancelled'],
    default: 'active',
  })
  @IsEnum(['active', 'completed', 'cancelled'])
  @IsOptional()
  status?: 'active' | 'completed' | 'cancelled';

  @ApiPropertyOptional()
  @IsOptional()
  completionDate?: Date;
}
