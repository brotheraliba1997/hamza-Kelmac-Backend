import { ApiProperty } from '@nestjs/swagger';
import {
  IsArray,
  IsEnum,
  IsMongoId,
  IsNotEmpty,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { AttendanceStatusEnum } from '../schema/attendance.schema';

export class StudentAttendanceDto {
  @ApiProperty({
    description: 'Student ID',
    example: '675f4aaf2b67a23d4c9f2941',
  })
  @IsMongoId()
  @IsNotEmpty()
  studentId: string;

  @ApiProperty({
    enum: AttendanceStatusEnum,
    description: 'Attendance status for this student',
    example: AttendanceStatusEnum.PRESENT,
  })
  @IsEnum(AttendanceStatusEnum)
  @IsNotEmpty()
  status: AttendanceStatusEnum;
}

export class BulkMarkAttendanceDto {
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
    description: 'Instructor ID who is marking the attendance',
    example: '675f4aaf2b67a23d4c9f2941',
  })
  @IsMongoId()
  @IsNotEmpty()
  markedBy: string;

  @ApiProperty({
    type: [StudentAttendanceDto],
    description: 'Array of students with their attendance status',
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => StudentAttendanceDto)
  students: StudentAttendanceDto[];
}

