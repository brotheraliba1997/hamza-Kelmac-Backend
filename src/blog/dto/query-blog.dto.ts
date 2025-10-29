import { ApiPropertyOptional } from '@nestjs/swagger';

export class FilterBlogDto {
  @ApiPropertyOptional({ example: '671018fabc123456789ef012' })
  authorId?: string;

  @ApiPropertyOptional({ example: true })
  isPublished?: boolean;

  @ApiPropertyOptional({ example: 'Blog Title' })
  title?: string;
}

export class SortBlogDto {
  @ApiPropertyOptional({ example: 'createdAt' })
  orderBy?: string;

  @ApiPropertyOptional({ example: 'DESC', enum: ['ASC', 'DESC'] })
  order?: 'ASC' | 'DESC';
}
