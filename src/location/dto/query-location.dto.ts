import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsOptional, IsString, IsNumber, Min } from 'class-validator';

export class FilterLocationDto {
  @ApiPropertyOptional({
    example: 'United States',
    description: 'Filter by country name',
  })
  @IsOptional()
  @IsString()
  country?: string;

  @ApiPropertyOptional({
    example: 'US',
    description: 'Filter by country code',
  })
  @IsOptional()
  @IsString()
  countryCode?: string;

  @ApiPropertyOptional({
    example: 'usd',
    description: 'Filter by currency',
  })
  @IsOptional()
  @IsString()
  currency?: string;

  @ApiPropertyOptional({
    example: 'search term',
    description: 'Full-text search query for country and country code',
  })
  @IsOptional()
  @IsString()
  search?: string;
}

export class SortLocationDto {
  @ApiPropertyOptional({
    example: 'createdAt',
    description: 'Field to sort by',
    enum: ['createdAt', 'updatedAt', 'country', 'countryCode', 'currency'],
  })
  @IsOptional()
  @IsString()
  orderBy?: string;

  @ApiPropertyOptional({
    example: 'desc',
    description: 'Sort order',
    enum: ['ASC', 'DESC'],
  })
  @IsOptional()
  @IsString()
  order?: 'ASC' | 'DESC';
}

export class QueryLocationDto {
  @ApiPropertyOptional({
    example: 1,
    description: 'Page number',
  })
  @IsOptional()
  @Transform(({ value }) => (value ? Number(value) : 1))
  @IsNumber()
  @Min(1)
  page?: number;

  @ApiPropertyOptional({
    example: 10,
    description: 'Items per page',
  })
  @IsOptional()
  @Transform(({ value }) => (value ? Number(value) : 10))
  @IsNumber()
  @Min(1)
  limit?: number;
}
