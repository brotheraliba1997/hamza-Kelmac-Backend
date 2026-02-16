import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsMongoId, IsOptional, IsString } from 'class-validator';
import { AttendanceStatusEnum } from '../schema/attendance.schema';

export class FilterAttendanceDto {
  @ApiPropertyOptional({
    description: 'Filter by class schedule ID',
    example: '675f4aaf2b67a23d4c9f2941',
  })
  @IsOptional()
  @IsMongoId()
  classScheduleId?: string;

  @ApiPropertyOptional({
    description: 'Filter by course ID',
    example: '675f4aaf2b67a23d4c9f2941',
  })
  @IsOptional()
  @IsMongoId()
  courseId?: string;

  @ApiPropertyOptional({
    description: 'Filter by session ID from course.sessions array (ObjectId)',
    example: '671018fabc123456789ef015',
  })
  @IsOptional()
  @IsMongoId()
  sessionId?: string;

  @ApiPropertyOptional({
    description: 'Filter by student ID',
    example: '675f4aaf2b67a23d4c9f2941',
  })
  @IsOptional()
  @IsMongoId()
  studentId?: string;

  @ApiPropertyOptional({
    description: 'Filter by instructor who marked attendance',
    example: '675f4aaf2b67a23d4c9f2941',
  })
  @IsOptional()
  @IsMongoId()
  markedBy?: string;

  @ApiPropertyOptional({
    enum: AttendanceStatusEnum,
    description: 'Filter by attendance status',
    example: AttendanceStatusEnum.PRESENT,
  })
  @IsOptional()
  @IsEnum(AttendanceStatusEnum)
  status?: AttendanceStatusEnum;
}

export class SortAttendanceDto {
  @ApiPropertyOptional({
    enum: ['asc', 'desc'],
    default: 'desc',
  })
  @IsOptional()
  @IsString()
  sortBy?: 'asc' | 'desc' = 'desc';
}
