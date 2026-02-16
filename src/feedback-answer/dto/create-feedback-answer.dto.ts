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
import { Types } from 'mongoose';

export class AnswerDto {
  @ApiProperty({
    description: 'Feedback question MongoDB ObjectId',
    example: '507f1f77bcf86cd799439012',
  })
  @IsMongoId()
  @IsNotEmpty()
  questionId: Types.ObjectId;

  @ApiProperty({
    description: 'User answer to the questions',
    example: '5',
  })
  @IsString()
  @IsNotEmpty()
  answer: string;

  @ApiProperty({
    description: 'Answer type (e.g., rating, text)',
    example: 'rating',
  })
  @IsString()
  @IsNotEmpty()
  type: string;
}

export class CreateFeedbackAnswerDto {
  @ApiProperty({
    description: 'User MongoDB ObjectId',
    example: '507f1f77bcf86cd799439011',
  })
  @IsMongoId()
  @IsNotEmpty()
  userId: string;

  @ApiProperty({
    description: 'Array of question-answer pairs',
    type: [AnswerDto],
    example: [
      { questionId: '507f1f77bcf86cd799439012', answer: '5', type: 'rating' },
      {
        questionId: '507f1f77bcf86cd799439014',
        answer: 'Great course!',
        type: 'text',
      },
    ],
  })
  @IsArray()
  @IsNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => AnswerDto)
  answers: AnswerDto[];

  @ApiProperty({
    description: 'Whether the class is finished',
    example: true,
  })
  @IsBoolean()
  @IsOptional()
  isClassFinished: boolean;
}
