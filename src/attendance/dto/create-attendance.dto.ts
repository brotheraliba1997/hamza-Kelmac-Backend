import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEnum,
  IsMongoId,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';
import { AttendanceStatusEnum } from '../schema/attendance.schema';

export class CreateAttendanceDto {
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
    description: 'Start date',
    example: '2025-12-09',
  })
  @IsString()
  @IsNotEmpty()
  startDate: string;  

  @ApiProperty({
    description: 'Start time',
    example: '14:00',
  })
  @IsString()
  @IsNotEmpty()
  startTime: string;

  @ApiProperty({
    enum: AttendanceStatusEnum,
    description: 'Attendance status',
    example: AttendanceStatusEnum.PRESENT,
  })
  @IsEnum(AttendanceStatusEnum)
  @IsNotEmpty()
  status: AttendanceStatusEnum;

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

