import {
  IsNotEmpty,
  IsString,
  IsMongoId,
  IsBoolean,
  IsArray,
  ValidateNested,
  IsOptional,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class QuestionDto {
  @ApiProperty({
    description: 'Feedback question text',
    example: 'How would you rate the course content?',
  })
  @IsString()
  @IsNotEmpty()
  question: string;

  @ApiProperty({
    description: 'Question type (e.g., rating, text, multiple_choice)',
    example: 'rating',
  })
  @IsString()
  @IsNotEmpty()
  type: string;

  @ApiProperty({
    description: 'Whether the question is active',
    example: true,
  })
  @IsBoolean()
  @IsNotEmpty()
  status: boolean;

  @ApiProperty({
    description: 'Array of feedback options',
    type: 'array',
    items: { type: 'string' },
    example: ['Very Good', 'Good', 'Average', 'Poor'],
  })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  options?: string[];

  @ApiProperty({
    description: 'Question title',
    example: 'Course Content',
  })
  @IsString()
  @IsNotEmpty()
  title: string;
}

export class CreateFeedbackDto {
  @ApiProperty({
    description: 'Course MongoDB ObjectId',
    example: '507f1f77bcf86cd799439011',
  })
  @IsMongoId()
  @IsOptional()
  courseId?: string;

  @ApiProperty({
    description: 'Array of feedback questions',
    type: [QuestionDto],
    example: [
      {
        question: 'How would you rate the course content?',
        type: 'rating',
        status: true,
      },
      {
        question: 'Any additional comments?',
        type: 'text',
        status: true,
      },
    ],
  })
  @IsArray()
  @IsNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => QuestionDto)
  questions: QuestionDto[];
}
