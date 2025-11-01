import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsOptional,
  IsMongoId,
  IsEnum,
  IsDateString,
  IsString,
} from 'class-validator';

export class FilterClassScheduleDto {
  @ApiPropertyOptional({
    description: 'Filter by instructor ID',
    example: '671018fabc123456789ef014',
  })
  @IsMongoId()
  @IsOptional()
  instructorId?: string;

  @ApiPropertyOptional({
    description: 'Filter by course ID',
    example: '671018fabc123456789ef013',
  })
  @IsMongoId()
  @IsOptional()
  courseId?: string;

  @ApiPropertyOptional({
    description: 'Filter by student ID (if student enrolled in class)',
    example: '671018fabc123456789ef015',
  })
  @IsMongoId()
  @IsOptional()
  studentId?: string;

  @ApiPropertyOptional({
    enum: ['scheduled', 'ongoing', 'completed', 'cancelled'],
    description: 'Filter by class status',
    example: 'scheduled',
  })
  @IsEnum(['scheduled', 'ongoing', 'completed', 'cancelled'])
  @IsOptional()
  status?: 'scheduled' | 'ongoing' | 'completed' | 'cancelled';

  @ApiPropertyOptional({
    description: 'Filter classes after a specific start date',
    example: '2025-11-01',
  })
  @IsDateString()
  @IsOptional()
  startDate?: string;

  @ApiPropertyOptional({
    description: 'Filter classes before a specific end date',
    example: '2025-11-30',
  })
  @IsDateString()
  @IsOptional()
  endDate?: string;

  @ApiPropertyOptional({
    description: 'Search by Google Meet link or security key',
    example: 'a6d2b99a-f81a-4cb5-a123-984e07fd9e33',
  })
  @IsString()
  @IsOptional()
  search?: string;
}

export class SortClassScheduleDto {
  @ApiPropertyOptional({
    description: 'Sort by field name (e.g. date, time, createdAt)',
    example: 'date',
  })
  @IsOptional()
  orderBy?: string;

  @ApiPropertyOptional({
    enum: ['ASC', 'DESC'],
    description: 'Sort order',
    example: 'DESC',
  })
  @IsOptional()
  order?: 'ASC' | 'DESC';
}
