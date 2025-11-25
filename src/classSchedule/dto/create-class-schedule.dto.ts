import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsMongoId,
  IsString,
  IsArray,
  IsEnum,
  IsOptional,
  IsDateString,
  IsUrl,
  Min,
  Max,
  IsNumber,
  ArrayNotEmpty,
} from 'class-validator';

export class CreateClassScheduleDto {
  @ApiProperty({
    example: '671018fabc123456789ef013',
    description: 'Course associated with the class',
  })
  @IsMongoId()
  course: string;

  @ApiPropertyOptional({
    example: '671018fabc123456789ef015',
    description:
      'Session ID from course.sessions array (required for session-based schedule creation)',
  })
  @IsString()
  @IsOptional()
  sessionId?: string;

  @ApiProperty({
    example: '671018fabc123456789ef014',
    description: 'Instructor assigned to this class',
  })
  @IsMongoId()
  instructor: string;

  @ApiProperty({
    type: String,
    example: '671018fabc123456789ef015',
    description: 'List of student IDs attending this class',
  })
  @IsString()
  @IsMongoId({ each: true })
  students: string;

  @ApiPropertyOptional({
    example: '2025-11-05',
    description:
      'Date of the class (ISO format: YYYY-MM-DD). Not needed for session-based creation (comes from timeBlocks)',
  })
  @IsString()
  @IsOptional()
  date?: string;

  @ApiPropertyOptional({
    example: '15:30',
    description:
      'Time of the class (HH:mm in 24-hour format). Not needed for session-based creation (comes from timeBlocks)',
  })
  @IsString()
  @IsOptional()
  time?: string;

  @ApiProperty({
    example: 60,
    description: 'Duration of the class in minutes',
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  duration?: number;

  @ApiProperty({
    example: 'https://meet.google.com/xyz-1234-abc',
    description: 'Google Meet link for the scheduled class',
  })
  @IsUrl()
  @IsOptional()
  googleMeetLink: string;

  @ApiProperty({
    example: 'a6d2b99a-f81a-4cb5-a123-984e07fd9e33',
    description: 'Unique key for meeting security validation',
  })
  @IsString()
  @IsOptional()
  securityKey: string;

  @ApiPropertyOptional({
    enum: ['scheduled', 'ongoing', 'completed', 'cancelled'],
    default: 'scheduled',
    description: 'Current status of the class',
  })
  @IsEnum(['scheduled', 'ongoing', 'completed', 'cancelled'])
  @IsOptional()
  status?: 'scheduled' | 'ongoing' | 'completed' | 'cancelled';

  @ApiPropertyOptional({
    example: 0,
    minimum: 0,
    maximum: 100,
    default: 0,
    description: 'Average progress percentage of the class',
  })
  @IsNumber()
  @Min(0)
  @Max(100)
  @IsOptional()
  progress?: number;

  @ApiPropertyOptional({
    example: '2025-11-05T15:30:00.000Z',
    description: 'Class start timestamp (optional)',
  })
  @IsOptional()
  @IsDateString()
  startedAt?: Date;

  @ApiPropertyOptional({
    example: '2025-11-05T16:30:00.000Z',
    description: 'Class end timestamp (optional)',
  })
  @IsOptional()
  @IsDateString()
  endedAt?: Date;

  @IsString()
  @IsOptional()
  googleCalendarEventLink: string;
}
