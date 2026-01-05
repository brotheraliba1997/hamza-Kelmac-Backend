import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Types } from 'mongoose';
import { User } from '../../users/domain/user';
// <database-block>
const idType = String;
// </database-block>

export class AssigmentEntity {
  @ApiProperty({ type: idType })
  id?: string | Types.ObjectId;

  @ApiProperty({
    description: 'Class Schedule ID',
    example: '675f4aaf2b67a23d4c9f2941',
  })
  classScheduleId: string | Types.ObjectId | any;

  @ApiProperty({
    description: 'Course ID - sessions array is inside course',
    example: '675f4aaf2b67a23d4c9f2941',
  })
  courseId: string | Types.ObjectId | any;

  @ApiProperty({
    description: 'Session ID from course.sessions array (ObjectId)',
    example: '671018fabc123456789ef015',
  })
  sessionId: string | Types.ObjectId;

  @ApiProperty({
    description: 'Student whose Assigment is marked',
    example: '675f4aaf2b67a23d4c9f2941',
  })
  student: string | Types.ObjectId | User;

  @ApiProperty({
    description: 'Instructor who marked the Assigment',
    example: '675f4aaf2b67a23d4c9f2941',
  })
  markedBy: string | Types.ObjectId | User;

  @ApiProperty({
    description: 'Marks awarded for the assignment',
    example: 10,
  })
  marks: number;

  @ApiPropertyOptional({
    description: 'Optional notes about the Assigment',
    example: 'Student arrived 10 minutes late',
  })
  notes?: string;



  @ApiPropertyOptional({
    description: 'Certificate PDF URL',
    example: 'http://localhost:5000/pdfs/Certificate No. 1.pdf',
  })
  certificateUrl?: string;

  @ApiProperty({
    description: 'Index of the timeBlock in session.timeBlocks array (0-based)',
    example: 0,
  })
  timeBlockIndex: number;

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
