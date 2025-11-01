import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Allow } from 'class-validator';
import { Types } from 'mongoose';
import { User } from '../../users/domain/user';
import { CourseEntity } from '../../course/domain/course';

// <database-block>
const idType = String;
// </database-block>

export class ClassScheduleEntity {
  // ✅ Constructor added — fixes the mapper error
  constructor(partial: Partial<ClassScheduleEntity>) {
    Object.assign(this, partial);
  }

  @ApiProperty({ type: idType })
  @Allow()
  id?: string | Types.ObjectId;

  @ApiProperty({
    type: idType,
    example: '671018fabc123456789ef013',
    description: 'Course associated with this class',
  })
  @Allow()
  course: string | Types.ObjectId | CourseEntity;

  @ApiProperty({
    type: idType,
    example: '671018fabc123456789ef014',
    description: 'Instructor conducting the class',
  })
  @Allow()
  instructor: string | Types.ObjectId | User;

  @ApiProperty({
    type: [idType],
    example: ['671018fabc123456789ef015', '671018fabc123456789ef016'],
    description: 'List of students enrolled/assigned to this class',
  })
  @Allow()
  students: (string | Types.ObjectId | User)[];

  @ApiProperty({
    example: '2025-11-05',
    description: 'Date of the class (ISO format YYYY-MM-DD)',
  })
  @Allow()
  date: string;

  @ApiProperty({
    example: '15:30',
    description: 'Time of the class (HH:mm 24-hour format)',
  })
  @Allow()
  time: string;

  @ApiProperty({
    example: 'https://meet.google.com/xyz-1234-abc',
    description: 'Google Meet link for this class session',
  })
  @Allow()
  googleMeetLink: string;

  @ApiProperty({
    example: 'a6d2b99a-f81a-4cb5-a123-984e07fd9e33',
    description: 'Unique security key for joining class securely',
  })
  @Allow()
  securityKey: string;

  @ApiProperty({
    enum: ['scheduled', 'ongoing', 'completed', 'cancelled'],
    example: 'scheduled',
    default: 'scheduled',
    description: 'Current status of the class',
  })
  @Allow()
  status: 'scheduled' | 'ongoing' | 'completed' | 'cancelled';

  @ApiProperty({
    example: 0,
    minimum: 0,
    maximum: 100,
    default: 0,
    description: 'Average completion or attendance progress of this class',
  })
  @Allow()
  progress: number;

  @ApiPropertyOptional({
    example: '2025-11-05T15:30:00.000Z',
    description: 'Timestamp when the class actually started',
  })
  @Allow()
  startedAt?: Date;

  @ApiPropertyOptional({
    example: '2025-11-05T16:30:00.000Z',
    description: 'Timestamp when the class ended',
  })
  @Allow()
  endedAt?: Date;

  @ApiPropertyOptional({
    example: '2025-11-05T15:32:00.000Z',
    description: 'When students joined (if tracking join time)',
  })
  @Allow()
  attendedAt?: Date;

  @ApiPropertyOptional({
    example: 'https://certificates.myapp.com/abcd1234.pdf',
    description: 'Optional certificate or report link for the class',
  })
  @Allow()
  certificateLink?: string;

  @ApiProperty({ example: '2025-10-31T10:00:00.000Z' })
  @Allow()
  createdAt: Date;

  @ApiProperty({ example: '2025-10-31T10:00:00.000Z' })
  @Allow()
  updatedAt: Date;

  @ApiPropertyOptional({ example: '2025-10-31T10:00:00.000Z' })
  @Allow()
  deletedAt?: Date | null;
}
