import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsBoolean,
  IsNumber,
  Min,
  IsArray,
  Matches,
} from 'class-validator';

export class CreateCategoryDto {
  @ApiProperty({ example: 'Web Development' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiPropertyOptional({ example: 'web-development' })
  @IsString()
  @IsOptional()
  slug?: string;

  @ApiPropertyOptional({
    example: 'Learn web development from basics to advanced',
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({ example: 'fas fa-code' })
  @IsString()
  @IsOptional()
  icon?: string;

  @ApiPropertyOptional({ example: 'https://example.com/image.jpg' })
  @IsString()
  @IsOptional()
  image?: string;

  @ApiPropertyOptional({ example: '#3498db' })
  @IsString()
  @IsOptional()
  @Matches(/^#[0-9A-F]{6}$/i, {
    message: 'Color must be a valid hex color code (e.g., #3498db)',
  })
  color?: string;

  @ApiPropertyOptional({
    example: ['Frontend Development', 'Backend Development'],
  })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  subcategories?: string[];

  @ApiPropertyOptional({ example: 0 })
  @IsNumber()
  @Min(0)
  @IsOptional()
  order?: number;

  @ApiPropertyOptional({ example: true })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @ApiPropertyOptional({ example: false })
  @IsBoolean()
  @IsOptional()
  isFeatured?: boolean;
}
