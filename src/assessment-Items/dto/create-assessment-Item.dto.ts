import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsNumber, IsMongoId } from 'class-validator';
import { Types } from 'mongoose';

export class CreateAssessmentItemDto {
  @ApiProperty({ description: 'Reference to the tests', example: '64f9c9...' })
  @IsNotEmpty()
  @IsMongoId()
  courseId: Types.ObjectId;

  @ApiProperty({ description: 'Day of the assessment', example: 'Day 1' })
  @IsNotEmpty()
  @IsString()
  day: string;

  @ApiProperty({ description: 'Topic reference', example: '1.1.2' })
  @IsNotEmpty()
  @IsString()
  topicRef: string;

  @ApiProperty({
    description: 'Title of the assessment item',
    example: 'ISO 19011 Terminology...',
  })
  @IsNotEmpty()
  @IsString()
  title: string;

  @ApiProperty({ description: 'Credit unit', example: 'AU' })
  @IsNotEmpty()
  @IsString()
  cu: string;

  @ApiProperty({ description: 'Maximum marks for this item', example: 10 })
  @IsNotEmpty()
  @IsNumber()
  maxMarks: number;
}
