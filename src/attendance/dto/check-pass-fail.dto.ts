import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsMongoId, IsNotEmpty, IsOptional, IsBoolean } from 'class-validator';

export class CheckPassFailDto {
  @ApiProperty({
    description: 'Class Schedule ID',
    example: '675f4aaf2b67a23d4c9f2941',
  })
  @IsMongoId()
  @IsNotEmpty()
  classScheduleId: string;

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

  @ApiPropertyOptional({
    description: 'Automatically issue certificate for passed students',
    example: false,
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  issueCertificates?: boolean;
}

export class StudentPassFailResult {
  @ApiProperty()
  studentId: string;

  @ApiProperty()
  studentName: string;

  @ApiProperty()
  totalClasses: number;

  @ApiProperty()
  presentCount: number;

  @ApiProperty()
  absentCount: number;

  @ApiProperty({
    enum: ['PASS', 'FAIL'],
  })
  result: 'PASS' | 'FAIL';

  @ApiPropertyOptional()
  certificateIssued?: boolean;

  @ApiPropertyOptional()
  certificateId?: string;
}

export class PassFailSummary {
  @ApiProperty()
  classScheduleId: string;

  @ApiProperty()
  courseId: string;

  @ApiProperty()
  sessionId: string;

  @ApiProperty()
  totalStudents: number;

  @ApiProperty()
  passedStudents: number;

  @ApiProperty()
  failedStudents: number;

  @ApiProperty({ type: [StudentPassFailResult] })
  results: StudentPassFailResult[];
}

