// dto/create-student-item-grade.dto.ts

import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsMongoId,
  IsNumber,
  Min,
  ValidateNested,
} from 'class-validator';

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

export class createManyStudentItemGradeDto {
  @ApiProperty({
    example: [
      {
        studentId: '68fdf94006e63abc0d5a12e4',
        assessmentItemId: '65afd1206f1e23abc45a9912',
        obtainedMarks: 8,
      },
    ],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateStudentItemGradeDto)
  grades: CreateStudentItemGradeDto[];
}
