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

// Topic Item Entity
export class TopicItemEntity {
  @ApiProperty({ example: 'Introduction to Variables' })
  title: string;

  @ApiProperty({
    example: 'Learn about variable declaration and types',
    required: false,
  })
  description?: string;

  @ApiProperty({ example: false })
  isCompleted: boolean;

  @ApiProperty({ example: 1 })
  order?: number;
}

// Session Entity
export class SessionEntity {
  @ApiProperty({ example: 'Introduction to Programming' })
  title: string;

  @ApiProperty({
    example: 'This session covers programming fundamentals',
    required: false,
  })
  description?: string;

  @ApiProperty({
    example: 'lecture',
    enum: ['lecture', 'introduction', 'break', 'lunch', 'end_of_day'],
  })
  sessionType: string;

  @ApiProperty({ example: '09:00', required: false })
  startTime?: string;

  @ApiProperty({ example: '10:30', required: false })
  endTime?: string;

  @ApiProperty({
    example: 'https://example.com/videos/intro.mp4',
    required: false,
  })
  videoUrl?: string;

  @ApiProperty({ example: 'Detailed session content...', required: false })
  content?: string;

  @ApiProperty({ example: 90, description: 'Duration in minutes' })
  duration: number;

  @ApiProperty({ example: false })
  isFree: boolean;

  @ApiProperty({ example: false })
  isBreak: boolean;

  @ApiProperty({ type: [TopicItemEntity], default: [] })
  topics: TopicItemEntity[];

  @ApiProperty({
    type: [String],
    default: [],
    example: ['https://example.com/resources/slides.pdf'],
  })
  resources: string[];

  @ApiProperty({ example: '#FF5733', required: false })
  color?: string;

  @ApiProperty({ example: 1 })
  order: number;

  @ApiProperty({ example: 'DAY 01', required: false })
  dayGroup?: string;

  @ApiProperty({ example: 1, required: false })
  dayNumber?: number;

  @ApiProperty({ example: '2025-10-29T10:00:00.000Z', required: false })
  createdAt?: Date;

  @ApiProperty({ example: '2025-10-29T10:00:00.000Z', required: false })
  updatedAt?: Date;
}

// FAQ Entity
export class FAQEntity {
  @ApiProperty({ example: 'What are the prerequisites?' })
  question: string;

  @ApiProperty({ example: 'No prior experience required' })
  answer: string;
}

// Course Snapshot Entity
export class CourseSnapshotEntity {
  @ApiProperty({ example: 24 })
  totalLectures: number;

  @ApiProperty({ example: 16, description: 'Total duration in hours' })
  totalDuration: number;

  @ApiProperty({
    example: 'Beginner',
    enum: ['Beginner', 'Intermediate', 'Advanced', 'All Levels'],
  })
  skillLevel: string;

  @ApiProperty({ example: 'English' })
  language: string;

  @ApiProperty({ example: 'Spanish', required: false })
  captionsLanguage?: string;

  @ApiProperty({ example: 120 })
  enrolledStudents: number;

  @ApiProperty({ example: true })
  certificate: boolean;

  @ApiProperty({ example: true })
  lifetimeAccess: boolean;

  @ApiProperty({ example: true })
  mobileAccess: boolean;
}

// Course Details Entity
export class CourseDetailsEntity {
  @ApiProperty({
    type: [String],
    example: ['Build real-world projects', 'Master MERN stack'],
  })
  whatYouWillLearn: string[];

  @ApiProperty({
    type: [String],
    example: ['Basic computer skills', 'Internet connection'],
  })
  requirements: string[];

  @ApiProperty({
    type: [String],
    example: ['Aspiring web developers', 'Career switchers'],
  })
  targetAudience: string[];

  @ApiProperty({
    type: [String],
    example: ['Lifetime access', 'Certificate of completion'],
  })
  features: string[];
}

// Pricing Entity
export class PricingEntity {
  @ApiProperty({ example: 'one-time', enum: ['one-time', 'subscription'] })
  type: string;

  @ApiProperty({ example: 249 })
  amount: number;

  @ApiProperty({ example: 'USD', enum: ['USD', 'EUR', 'GBP', 'INR'] })
  currency: string;

  @ApiProperty({ example: 'Full course access' })
  description: string;
}

// TimeTable Entity
export class TimeTableEntity {
  @ApiProperty({ example: '2025-11-15T09:00:00.000Z' })
  date: Date;

  @ApiProperty({ example: 'Weekend Batch - Morning Session' })
  description: string;

  @ApiProperty({ example: '9:00 AM - 1:00 PM', required: false })
  time?: string;

  @ApiProperty({
    type: [String],
    example: [],
    description: 'Array of student IDs enrolled',
  })
  studentsEnrolled: string[];
}

// Main Course Entity
export class CourseEntity {
  @ApiProperty({ type: idType })
  id: number | string;

  // Basic Information
  @ApiProperty({ example: 'Full Stack Web Development Bootcamp' })
  title: string;

  @ApiProperty({ example: 'full-stack-web-development-bootcamp' })
  slug: string;

  @ApiProperty({ example: 'Master modern web development', required: false })
  subtitle?: string;

  @ApiProperty({
    example: 'Learn MERN stack development from scratch.',
    required: false,
  })
  description?: string;

  @ApiProperty({
    example: 'Complete overview of the course...',
    required: false,
  })
  overview?: string;

  @ApiProperty({ example: '670e6c1234abcd56789ef012' })
  instructor: Types.ObjectId | User;

  // Category & Classification
  @ApiProperty({ example: 'web-development' })
  category: string;

  @ApiProperty({
    type: [String],
    example: ['Frontend', 'Backend'],
    default: [],
  })
  subcategories: string[];

  @ApiProperty({
    type: [String],
    example: ['React', 'Node.js', 'MongoDB'],
    default: [],
  })
  topics: string[];

  // Media
  @ApiProperty({
    example: 'https://example.com/thumbnail.jpg',
    required: false,
  })
  thumbnailUrl?: string;

  @ApiProperty({ example: 'https://example.com/preview.mp4', required: false })
  previewVideoUrl?: string;

  // Content
  @ApiProperty({ type: [SessionEntity], default: [] })
  sessions: SessionEntity[];

  @ApiProperty({ type: CourseSnapshotEntity, required: false })
  snapshot?: CourseSnapshotEntity;

  @ApiProperty({ type: CourseDetailsEntity, required: false })
  details?: CourseDetailsEntity;

  @ApiProperty({ type: [FAQEntity], default: [] })
  faqs: FAQEntity[];

  // Pricing
  @ApiProperty({ example: 249 })
  price: number;

  @ApiProperty({ example: 199, required: false })
  discountedPrice?: number;

  @ApiProperty({
    example: 20,
    description: 'Discount percentage 0-100',
    required: false,
  })
  discountPercentage?: number;

  @ApiProperty({ example: 'USD', enum: ['USD', 'EUR', 'GBP', 'INR'] })
  currency: string;

  @ApiProperty({ type: [PricingEntity], default: [], required: false })
  pricing?: PricingEntity[];

  // Stats & Engagement
  @ApiProperty({ example: 120 })
  enrolledCount: number;

  @ApiProperty({ example: 4.5, description: 'Average rating 0-5' })
  averageRating: number;

  @ApiProperty({ example: 45 })
  totalReviews: number;

  @ApiProperty({ example: 50 })
  totalRatings: number;

  // Publishing & Status
  @ApiProperty({ example: true })
  isPublished: boolean;

  @ApiProperty({ example: false })
  isFeatured: boolean;

  @ApiProperty({ example: false })
  isBestseller: boolean;

  @ApiProperty({ example: true })
  isNew: boolean;

  @ApiProperty({ example: '2025-10-29T10:00:00.000Z', required: false })
  publishedAt?: Date;

  @ApiProperty({ example: '2025-11-01T10:00:00.000Z', required: false })
  lastUpdated?: Date;

  // Schedule & Timetable
  @ApiProperty({ type: [TimeTableEntity], default: [] })
  timeTable: TimeTableEntity[];

  // Timestamps
  @ApiProperty({ example: '2025-10-29T10:00:00.000Z', required: false })
  createdAt?: Date;

  @ApiProperty({ example: '2025-10-29T10:00:00.000Z', required: false })
  updatedAt?: Date;

  @ApiProperty({ example: null, required: false })
  deletedAt?: Date | null;

  constructor(partial: Partial<CourseEntity>) {
    Object.assign(this, partial);
  }
}
