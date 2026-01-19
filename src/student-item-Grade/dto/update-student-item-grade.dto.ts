// dto/update-student-item-grade.dto.ts

import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsNumber, Min, IsOptional } from 'class-validator';

export class UpdateStudentItemGradeDto {
  @ApiPropertyOptional({
    example: 9,
    description: 'Updated obtained marks',
  })
  @IsNumber()
  @Min(0)
  @IsOptional()
  obtainedMarks?: number;
}
