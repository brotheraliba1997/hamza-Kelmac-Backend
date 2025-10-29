import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsMongoId, IsOptional, IsString } from 'class-validator';

export class CreateBlogDto {
  @ApiProperty({
    description: 'The title of the blog post',
    example: 'My First Blog Post',
  })
  @IsString()
  title: string;

  @ApiProperty({
    description: 'The content of the blog post',
    example: 'This is the content of my blog post...',
  })
  @IsString()
  content: string;

  @ApiProperty({
    description: 'The MongoDB ID of the author',
    example: '507f1f77bcf86cd799439011',
  })
  @IsMongoId()
  author: string;

  @ApiPropertyOptional({
    description: 'Array of comments',
    example: ['Great post!', 'Thanks for sharing'],
    type: [String],
  })
  @IsOptional()
  comments?: string[];
}
