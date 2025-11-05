import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsOptional,
  IsString,
  IsBoolean,
  IsNumber,
  IsEnum,
  Min,
  Max,
} from 'class-validator';
import { SkillLevelEnum } from '../schema/course.schema';

export class FilterCourseDto {
  @ApiPropertyOptional({
    example: '671018fabc123456789ef012',
    description: 'Filter by instructor ID',
  })
  @IsOptional()
  @IsString()
  instructorId?: string;

  @ApiPropertyOptional({
    example: 'web-development',
    description: 'Filter by category slug',
  })
  @IsOptional()
  @IsString()
  category?: string;

  @ApiPropertyOptional({
    example: 'Frontend Development',
    description: 'Filter by subcategory',
  })
  @IsOptional()
  @IsString()
  subcategory?: string;

  @ApiPropertyOptional({
    example: true,
    description: 'Filter by published status',
  })
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean()
  isPublished?: boolean;

  @ApiPropertyOptional({
    example: true,
    description: 'Filter featured courses',
  })
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean()
  isFeatured?: boolean;

  @ApiPropertyOptional({
    example: true,
    description: 'Filter bestseller courses',
  })
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean()
  isBestseller?: boolean;

  @ApiPropertyOptional({
    example: true,
    description: 'Filter new courses',
  })
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean()
  isNew?: boolean;

  @ApiPropertyOptional({
    example: 0,
    description: 'Minimum price',
  })
  @IsOptional()
  @Transform(({ value }) => (value ? Number(value) : undefined))
  @IsNumber()
  @Min(0)
  minPrice?: number;

  @ApiPropertyOptional({
    example: 500,
    description: 'Maximum price',
  })
  @IsOptional()
  @Transform(({ value }) => (value ? Number(value) : undefined))
  @IsNumber()
  @Min(0)
  maxPrice?: number;

  @ApiPropertyOptional({
    example: 4.5,
    description: 'Minimum average rating',
  })
  @IsOptional()
  @Transform(({ value }) => (value ? Number(value) : undefined))
  @IsNumber()
  @Min(0)
  @Max(5)
  minRating?: number;

  @ApiPropertyOptional({
    enum: SkillLevelEnum,
    example: SkillLevelEnum.BEGINNER,
    description: 'Filter by skill level',
  })
  @IsOptional()
  @IsEnum(SkillLevelEnum)
  skillLevel?: SkillLevelEnum;

  @ApiPropertyOptional({
    example: 'English',
    description: 'Filter by language',
  })
  @IsOptional()
  @IsString()
  language?: string;

  @ApiPropertyOptional({
    example: 'JavaScript',
    description: 'Search by topic',
  })
  @IsOptional()
  @IsString()
  topic?: string;

  @ApiPropertyOptional({
    example: 'web development',
    description: 'Full-text search query',
  })
  @IsOptional()
  @IsString()
  search?: string;
}

export class SortCourseDto {
  @ApiPropertyOptional({
    example: 'createdAt',
    description: 'Field to sort by',
    enum: [
      'createdAt',
      'updatedAt',
      'title',
      'price',
      'enrolledCount',
      'averageRating',
      'publishedAt',
    ],
  })
  @IsOptional()
  @IsString()
  orderBy?: string;

  @ApiPropertyOptional({
    example: 'DESC',
    enum: ['ASC', 'DESC'],
    description: 'Sort order',
  })
  @IsOptional()
  @IsEnum(['ASC', 'DESC'])
  order?: 'ASC' | 'DESC';
}

export class QueryCourseDto {
  @ApiPropertyOptional({ example: 1, description: 'Page number' })
  @IsOptional()
  @Transform(({ value }) => (value ? Number(value) : 1))
  @IsNumber()
  @Min(1)
  page?: number;

  @ApiPropertyOptional({
    example: 10,
    description: 'Items per page (max: 50)',
  })
  @IsOptional()
  @Transform(({ value }) => (value ? Number(value) : 10))
  @IsNumber()
  @Min(1)
  @Max(50)
  limit?: number;
}
