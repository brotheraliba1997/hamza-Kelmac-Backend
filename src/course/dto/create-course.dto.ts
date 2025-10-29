import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsArray,
  IsMongoId,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateCourseDto {
  @ApiProperty({
    description: 'The title of the course',
    example: 'Introduction to Web Development',
  })
  @IsString()
  title: string;

  @ApiPropertyOptional({
    description: 'A detailed description of the course',
    example:
      'Learn the basics of web development including HTML, CSS, and JavaScript',
  })
  @IsOptional()
  description?: string;

  @ApiProperty({
    description: 'The MongoDB ID of the instructor',
    example: '507f1f77bcf86cd799439011',
  })
  @IsMongoId()
  instructor: string;

  @ApiPropertyOptional({
    description: 'The price of the course',
    example: 99.99,
    minimum: 0,
  })
  @IsNumber()
  @IsOptional()
  price?: number;

  @ApiPropertyOptional({
    description: 'Array of course modules',
    type: 'array',
    items: {
      type: 'object',
      properties: {
        title: { type: 'string', example: 'Module 1: Getting Started' },
        lessons: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              title: { type: 'string' },
              content: { type: 'string' },
              videoUrl: { type: 'string' },
            },
          },
        },
      },
    },
  })
  @IsArray()
  @IsOptional()
  modules?: any[];
}
