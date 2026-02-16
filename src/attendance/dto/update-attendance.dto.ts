import { PartialType } from '@nestjs/mapped-types';
import { CreateAttendanceDto } from './create-attendance.dto';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString } from 'class-validator';
import { AttendanceStatusEnum } from '../schema/attendance.schema';

export class UpdateAttendanceDto extends PartialType(CreateAttendanceDto) {
  @ApiPropertyOptional({
    enum: AttendanceStatusEnum,
    description: 'Updated attendance status',
    example: AttendanceStatusEnum.ABSENT,
  })
  @IsOptional()
  @IsEnum(AttendanceStatusEnum)
  status?: AttendanceStatusEnum;

  @ApiPropertyOptional({
    description: 'Updated notes about the attendance',
    example: 'Updated: Student was excused due to medical emergency',
  })
  @IsOptional()
  @IsString()
  notes?: string;
}
