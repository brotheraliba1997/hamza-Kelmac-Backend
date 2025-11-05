import { ApiProperty } from '@nestjs/swagger';
import { Allow } from 'class-validator';
import databaseConfig from '../../database/config/database.config';
import { DatabaseConfig } from '../../database/config/database-config.type';
import { Types } from 'mongoose';
import { User } from '../../users/domain/user';

// <database-block>
const idType = (databaseConfig() as DatabaseConfig).isDocumentDatabase
  ? String
  : Number;
// </database-block>

export class LessonEntity {
  @ApiProperty({
    type: idType,
  })
  @ApiProperty({ example: 'Introduction to Programming' })
  title: string;

  @ApiProperty({
    example: 'https://example.com/videos/intro.mp4',
    required: false,
  })
  videoUrl?: string;

  @ApiProperty({
    example: 'In this lesson, we will cover the basics of programming...',
    required: false,
  })
  content?: string;

  @ApiProperty({ example: '2025-10-29T10:00:00.000Z', required: false })
  createdAt?: Date;

  @ApiProperty({ example: '2025-10-29T10:00:00.000Z', required: false })
  updatedAt?: Date;
}

export class ModuleEntity {
  @ApiProperty({
    type: idType,
  })
  @ApiProperty({ example: 'Module 1: Getting Started' })
  title: string;

  @ApiProperty({
    type: [LessonEntity],
    description: 'List of lessons in this module',
    default: [],
  })
  lessons: LessonEntity[];

  @ApiProperty({ example: '2025-10-29T10:00:00.000Z', required: false })
  createdAt?: Date;

  @ApiProperty({ example: '2025-10-29T10:00:00.000Z', required: false })
  updatedAt?: Date;
}

export class CourseEntity {
  @ApiProperty({
    type: idType,
  })
  id: number | string;

  @ApiProperty({ example: 'Full Stack Web Development Bootcamp' })
  title: string;

  @ApiProperty({
    example: 'full-stack-web-development-bootcamp',
    description: 'URL-friendly slug for the course',
  })
  slug?: string;

  @ApiProperty({
    example: 'Learn MERN stack development from scratch.',
    required: false,
  })
  description?: string;

  @ApiProperty({
    example: '670e6c1234abcd56789ef012',
    description: 'MongoDB ObjectId reference to the instructor (User)',
  })
  instructor: Types.ObjectId | User;

  @ApiProperty({
    type: [ModuleEntity],
    description: 'Modules included in the course',
    default: [],
  })
  modules: ModuleEntity[];

  @ApiProperty({ example: 199, description: 'Price of the course' })
  price: number;

  @ApiProperty({
    example: 120,
    description: 'Number of students enrolled in the course',
  })
  enrolledCount: number;

  @ApiProperty({
    example: true,
    description: 'Whether the course is published',
  })
  isPublished: boolean;

  @ApiProperty({ example: '2025-10-29T10:00:00.000Z', required: false })
  createdAt?: Date;

  @ApiProperty({ example: '2025-10-29T10:00:00.000Z', required: false })
  updatedAt?: Date;

  @ApiProperty({
    example: null,
    required: false,
    description: 'Soft delete timestamp (null if active)',
  })
  deletedAt?: Date | null;

  constructor(partial: Partial<CourseEntity>) {
    Object.assign(this, partial);
  }
}
