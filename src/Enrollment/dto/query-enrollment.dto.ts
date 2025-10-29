import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsOptional,
  IsMongoId,
  IsEnum,
  IsNumber,
  Min,
  Max,
} from 'class-validator';

export class FilterEnrollmentDto {
  @ApiPropertyOptional()
  @IsMongoId()
  @IsOptional()
  userId?: string;

  @ApiPropertyOptional()
  @IsMongoId()
  @IsOptional()
  courseId?: string;

  @ApiPropertyOptional({ enum: ['active', 'completed', 'cancelled'] })
  @IsEnum(['active', 'completed', 'cancelled'])
  @IsOptional()
  status?: 'active' | 'completed' | 'cancelled';

  @ApiPropertyOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  @IsOptional()
  minProgress?: number;

  @ApiPropertyOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  @IsOptional()
  maxProgress?: number;
}

export class SortEnrollmentDto {
  @ApiPropertyOptional()
  @IsOptional()
  orderBy?: string;

  @ApiPropertyOptional({ enum: ['ASC', 'DESC'] })
  @IsOptional()
  order?: 'ASC' | 'DESC';
}
