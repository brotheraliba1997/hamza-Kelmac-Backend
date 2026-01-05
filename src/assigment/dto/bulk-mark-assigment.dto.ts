import { ApiProperty } from '@nestjs/swagger';
import {
  IsArray,
  IsEnum,
  IsMongoId,
  IsNotEmpty,
  IsNumber,
  IsString,
  Max,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
// import { AssigmentStatusEnum } from '../schema/Assigment.schema';

export class StudentAssignmentDto  {
  @ApiProperty({
    description: 'Student ID',
    example: '675f4aaf2b67a23d4c9f2941',
  })
  @IsMongoId()
  @IsNotEmpty()
  studentId: string;

  @ApiProperty({
    description: 'Assigment marks',
    example: 10,
    minimum: 0,
    maximum: 10,
  })
  @IsNumber()
  @Min(0)
  @Max(10)
  marks?: number;
}

export class BulkMarkAssignmentDto {
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
    description: 'Instructor ID who is marking the Assigment',
    example: '675f4aaf2b67a23d4c9f2941',
  })
  @IsMongoId()
  @IsNotEmpty()
  markedBy: string;

  @ApiProperty({
    type: [StudentAssignmentDto ],
    description: 'Array of students with their Assigment status',
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => StudentAssignmentDto )
  students: StudentAssignmentDto [];
}
