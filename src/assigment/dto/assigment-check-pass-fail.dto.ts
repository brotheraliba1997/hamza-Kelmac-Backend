import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsMongoId,
  IsNotEmpty,
  IsOptional,
  IsBoolean,
  IsNumber,
  Min,
  Max,
  IsEnum,
} from 'class-validator';

export enum PassFailStatusEnum {
  PASS = 'PASS',
  FAIL = 'FAIL',
}

export class AssignmentCheckPassFailDto {
  @ApiPropertyOptional({
    description: 'Class Schedule ID (optional - for reference only)',
    example: '675f4aaf2b67a23d4c9f2941',
  })
  @IsOptional()
  @IsMongoId()
  classScheduleId?: string;

  @ApiProperty({
    description: 'Course ID',
    example: '675f4aaf2b67a23d4c9f2941',
  })
  @IsMongoId()
  @IsNotEmpty()
  courseId: string;

  @ApiProperty({
    description: 'Session ID from course.sessions array',
    example: '671018fabc123456789ef015',
  })
  @IsMongoId()
  @IsNotEmpty()
  sessionId: string;

  @ApiProperty({
    description: 'Instructor ID who evaluated the assignment',
    example: '671018fabc123456789ef015',
  })
  @IsMongoId()
  @IsNotEmpty()
  markedBy: string;

  @ApiPropertyOptional({
    description: 'Automatically issue certificate for passed students',
    example: false,
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  issueCertificate?: boolean;

  @ApiProperty({
    description: 'Assignment marks',
    example: 10,
    minimum: 0,
    maximum: 10,
  })
  @IsNumber()
  @Min(0)
  @Max(10)
  marks: number;

  @ApiProperty({
    description: 'Pass or Fail status',
    enum: PassFailStatusEnum,
    example: PassFailStatusEnum.PASS,
  })
  @IsEnum(PassFailStatusEnum)
  @IsNotEmpty()
  status: PassFailStatusEnum;
}
