import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Types } from 'mongoose';
import { User } from '../../users/domain/user';


// <database-block>
const idType = String;
// </database-block>

export class AssignmentPassFailRecordEntity {
  @ApiProperty({ type: idType })
  id?: string | Types.ObjectId;

  @ApiProperty({
    description: 'Student ID',
    example: '675f4aaf2b67a23d4c9f2941',
  })
  studentId: string | Types.ObjectId | User;

  @ApiProperty({
    description: 'Course ID',
    example: '675f4aaf2b67a23d4c9f2941',
  })
  courseId: string | Types.ObjectId | any;

  @ApiProperty({
    description: 'Session ID from course.sessions array',
    example: '671018fabc123456789ef015',
  })
  sessionId: string | Types.ObjectId;

  @ApiPropertyOptional({
    description: 'Class Schedule ID (optional)',
    example: '675f4aaf2b67a23d4c9f2941',
  })
  classScheduleId?: string | Types.ObjectId | any;

 
  @ApiProperty({
    description: 'Total number of classes',
    example: 20,
  })
  totalClasses: number;

  @ApiProperty({
    description: 'Number of present attendance records',
    example: 18,
  })
  presentCount: number;

  @ApiProperty({
    description: 'Number of absent attendance records',
    example: 2,
  })
  absentCount: number;

  @ApiProperty({
    description: 'Attendance percentage',
    example: 90,
  })
  attendancePercentage: number;

  @ApiProperty({
    description: 'Whether operator has approved this pass/fail status',
    example: false,
  })
  isApproved: boolean;

  @ApiPropertyOptional({
    description: 'Operator who approved the status',
    example: '675f4aaf2b67a23d4c9f2941',
  })
  approvedBy?: string | Types.ObjectId | User;

  @ApiPropertyOptional({
    description: 'Timestamp when status was approved',
    example: '2025-02-18T10:30:00.000Z',
  })
  approvedAt?: Date;

  @ApiProperty({
    description: 'Whether certificate has been issued',
    example: false,
  })
  certificateIssued: boolean;

  @ApiPropertyOptional({
    description: 'Certificate ID if certificate has been issued',
    example: '675f4aaf2b67a23d4c9f2941',
  })
  certificateId?: string | Types.ObjectId;

  @ApiPropertyOptional({
    description: 'Certificate URL (PDF or link)',
    example: 'https://example.com/certificates/cert123.pdf',
  })
  certificateUrl?: string;

  @ApiPropertyOptional({
    description: 'Optional notes or remarks',
    example: 'Student completed all classes successfully',
  })
  notes?: string;

  @ApiProperty({
    description: 'Timestamp when pass/fail was determined',
    example: '2025-02-18T10:30:00.000Z',
  })
  determinedAt: Date;

  @ApiProperty({
    description: 'Record creation timestamp',
    example: '2025-02-18T10:30:00.000Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Record last update timestamp',
    example: '2025-02-18T10:30:00.000Z',
  })
  updatedAt: Date;
}

