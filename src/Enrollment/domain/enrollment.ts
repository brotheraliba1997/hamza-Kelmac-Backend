import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Allow } from 'class-validator';
import databaseConfig from '../../database/config/database.config';
import { DatabaseConfig } from '../../database/config/database-config.type';
import { Types } from 'mongoose';
import { User } from '../../users/domain/user';
import { CourseEntity } from '../../course/domain/course';

// <database-block>
const idType = String;
// </database-block>

export class EnrollmentEntity {
  @ApiProperty({
    type: idType,
  })
  @Allow()
  id?: string | Types.ObjectId;

  @ApiProperty({
    type: idType,
    example: '671018fabc123456789ef012',
  })
  @Allow()
  user: string | Types.ObjectId | User;

  @ApiProperty({
    type: idType,
    example: '671018fabc123456789ef013',
  })
  @Allow()
  course: string | Types.ObjectId | CourseEntity;

  @ApiPropertyOptional({
    type: idType,
    example: '671018fabc123456789ef014',
  })
  @Allow()
  payment?: string | Types.ObjectId;

  @ApiPropertyOptional({
    type: idType,
    example: '671018fabc123456789ef015',
  })
  @Allow()
  offer?: Types.ObjectId | string;

  @ApiProperty({
    example: 0,
    minimum: 0,
    maximum: 100,
    default: 0,
  })
  @Allow()
  progress: number;

  @ApiProperty({
    enum: ['active', 'completed', 'cancelled'],
    example: 'active',
    default: 'active',
  })
  @Allow()
  status: 'active' | 'completed' | 'cancelled';

  @ApiPropertyOptional({
    example: '2025-10-29T10:00:00.000Z',
  })
  @Allow()
  completionDate?: Date;

  @ApiPropertyOptional({
    type: idType,
    example: '671018fabc123456789ef016',
  })
  @Allow()
  certificate?: string | Types.ObjectId;

  @ApiProperty({ example: '2025-10-29T10:00:00.000Z' })
  @Allow()
  createdAt: Date;

  @ApiProperty({ example: '2025-10-29T10:00:00.000Z' })
  @Allow()
  updatedAt: Date;

  @ApiPropertyOptional({ example: '2025-10-29T10:00:00.000Z' })
  @Allow()
  deletedAt?: Date | null;
}
