import { ApiPropertyOptional } from '@nestjs/swagger';

export class FilterCourseDto {
  @ApiPropertyOptional({ example: '671018fabc123456789ef012' })
  instructorId?: string;

  @ApiPropertyOptional({ example: true })
  isPublished?: boolean;

  @ApiPropertyOptional({ example: 0 })
  minPrice?: number;

  @ApiPropertyOptional({ example: 500 })
  maxPrice?: number;
}

export class SortCourseDto {
  @ApiPropertyOptional({ example: 'createdAt' })
  orderBy?: string;

  @ApiPropertyOptional({ example: 'DESC', enum: ['ASC', 'DESC'] })
  order?: 'ASC' | 'DESC';
}
