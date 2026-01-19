// dto/create-student-item-grade.dto.ts

import { ApiProperty } from '@nestjs/swagger';
import { IsMongoId, IsNumber, Min } from 'class-validator';

export class CreateStudentItemGradeDto {
  @ApiProperty({
    example: '68fdf94006e63abc0d5a12e4',
    description: 'Student ID',
  })
  @IsMongoId()
  studentId: string;

  @ApiProperty({
    example: '65afd1206f1e23abc45a9912',
    description: 'Assessment Item ID',
  })
  @IsMongoId()
  assessmentItemId: string;

  @ApiProperty({
    example: 8,
    description: 'Marks obtained by student',
  })
  @IsNumber()
  @Min(0)
  obtainedMarks: number;
}
