import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsEnum,
  IsMongoId,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';

export class CreateAssignmentDto {
  @ApiProperty({
    description: 'Class Schedule ID',
    example: '675f4aaf2b67a23d4c9f2941',
  })
  @IsMongoId()
  @IsNotEmpty()
  classScheduleId: string;

  @ApiProperty({
    description: 'Course ID - sessions array is inside course',
    example: '675f4aaf2b67a23d4c9f2941',
  })
  @IsMongoId()
  @IsNotEmpty()
  courseId: string;

  @ApiProperty({
    description: 'Session ID from course.sessions array (ObjectId)',
    example: '671018fabc123456789ef015',
  })
  @IsMongoId()
  @IsNotEmpty()
  sessionId: string;

  @ApiProperty({
    description: 'Student ID whose attendance is being marked',
    example: '675f4aaf2b67a23d4c9f2941',
  })
  @IsMongoId()
  @IsNotEmpty()
  studentId: string;

  @ApiProperty({
    description: 'Instructor ID who is marking the attendance',
    example: '675f4aaf2b67a23d4c9f2941',
  })
  @IsMongoId()
  @IsNotEmpty()
  markedBy: string;

  @ApiProperty({
    description: 'Marks awarded for the assignment',
    example: 10,
  })
  @IsNumber() // validate as number
  @Min(0) // optional: minimum marks
  @Max(10) // optional: maximum marks
  @Type(() => Number) // convert incoming value to number
  marks: number;

  @ApiPropertyOptional({
    description: 'Optional notes about the attendance',
    example: 'Student arrived 10 minutes late',
  })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiPropertyOptional({
    description: 'PDF filename for certificate',
    example: 'Certificate No. 1.pdf',
  })
  @IsOptional()
  @IsString()
  pdfFileName?: string;
}
