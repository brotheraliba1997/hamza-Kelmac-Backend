import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsArray,
  IsMongoId,
  IsNumber,
  IsOptional,
  IsString,
  IsBoolean,
  IsEnum,
  ValidateNested,
  IsInt,
  Min,
  Max,
  Matches,
  MaxLength,
  IsDate,
} from 'class-validator';
import { Type } from 'class-transformer';
import {
  SessionTypeEnum,
  SkillLevelEnum,
  CurrencyEnum,
} from '../schema/course.schema';

// Topic Item DTO
export class TopicItemDto {
  @ApiProperty({ example: 'Variables and Data Types' })
  @IsString()
  title: string;

  @ApiPropertyOptional({ example: 'Understanding different data types' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({ example: false })
  @IsBoolean()
  @IsOptional()
  isCompleted?: boolean;

  @ApiPropertyOptional({ example: 1 })
  @IsInt()
  @Min(0)
  @IsOptional()
  order?: number;
}

// Session DTO
export class SessionDto {
  @ApiProperty({ example: 'Introduction to JavaScript' })
  @IsString()
  title: string;

  @ApiPropertyOptional({ example: 'Learn the fundamentals of JavaScript' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({
    enum: SessionTypeEnum,
    example: SessionTypeEnum.LECTURE,
  })
  @IsEnum(SessionTypeEnum)
  @IsOptional()
  sessionType?: SessionTypeEnum;

  @ApiPropertyOptional({
    example: '09:00',
    description: 'Start time in HH:MM format',
  })
  @Matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, {
    message: 'Start time must be in HH:MM format',
  })
  @IsOptional()
  startTime?: string;

  @ApiPropertyOptional({
    example: '10:30',
    description: 'End time in HH:MM format',
  })
  @Matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, {
    message: 'End time must be in HH:MM format',
  })
  @IsOptional()
  endTime?: string;

  @ApiPropertyOptional({ example: 'https://example.com/video.mp4' })
  @IsString()
  @IsOptional()
  videoUrl?: string;

  @ApiPropertyOptional({ example: 'Detailed session content here...' })
  @IsString()
  @IsOptional()
  content?: string;

  @ApiPropertyOptional({ example: 90, description: 'Duration in minutes' })
  @IsInt()
  @Min(0)
  @IsOptional()
  duration?: number;

  @ApiPropertyOptional({ example: false })
  @IsBoolean()
  @IsOptional()
  isFree?: boolean;

  @ApiPropertyOptional({ example: false })
  @IsBoolean()
  @IsOptional()
  isBreak?: boolean;

  @ApiPropertyOptional({ type: [TopicItemDto] })
  @ValidateNested({ each: true })
  @Type(() => TopicItemDto)
  @IsArray()
  @IsOptional()
  topics?: TopicItemDto[];

  @ApiPropertyOptional({
    type: [String],
    example: ['https://example.com/resource1.pdf'],
  })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  resources?: string[];

  @ApiPropertyOptional({
    example: '#3498db',
    description: 'Hex color code',
  })
  @Matches(/^#[0-9A-F]{6}$/i, {
    message: 'Color must be a valid hex color code',
  })
  @IsOptional()
  color?: string;

  @ApiPropertyOptional({ example: 1 })
  @IsInt()
  @Min(0)
  @IsOptional()
  order?: number;

  @ApiPropertyOptional({ example: 'DAY 01' })
  @IsString()
  @IsOptional()
  dayGroup?: string;

  @ApiPropertyOptional({ example: 1 })
  @IsInt()
  @Min(1)
  @IsOptional()
  dayNumber?: number;
}

// FAQ DTO
export class FAQDto {
  @ApiProperty({ example: 'What are the prerequisites?' })
  @IsString()
  question: string;

  @ApiProperty({ example: 'Basic programming knowledge is recommended' })
  @IsString()
  answer: string;
}

// Course Snapshot DTO
export class CourseSnapshotDto {
  @ApiPropertyOptional({ example: 120 })
  @IsInt()
  @Min(0)
  @IsOptional()
  totalLectures?: number;

  @ApiPropertyOptional({ example: 40, description: 'Total duration in hours' })
  @IsNumber()
  @Min(0)
  @IsOptional()
  totalDuration?: number;

  @ApiPropertyOptional({
    enum: SkillLevelEnum,
    example: SkillLevelEnum.BEGINNER,
  })
  @IsEnum(SkillLevelEnum)
  @IsOptional()
  skillLevel?: SkillLevelEnum;

  @ApiPropertyOptional({ example: 'English' })
  @IsString()
  @IsOptional()
  language?: string;

  @ApiPropertyOptional({ example: 'English, Spanish' })
  @IsString()
  @IsOptional()
  captionsLanguage?: string;

  @ApiPropertyOptional({ example: 0 })
  @IsInt()
  @Min(0)
  @IsOptional()
  enrolledStudents?: number;

  @ApiPropertyOptional({ example: true })
  @IsBoolean()
  @IsOptional()
  certificate?: boolean;

  @ApiPropertyOptional({ example: true })
  @IsBoolean()
  @IsOptional()
  lifetimeAccess?: boolean;

  @ApiPropertyOptional({ example: true })
  @IsBoolean()
  @IsOptional()
  mobileAccess?: boolean;
}

// Course Details DTO
export class CourseDetailsDto {
  @ApiPropertyOptional({
    type: [String],
    example: ['Build modern web applications', 'Master JavaScript'],
  })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  whatYouWillLearn?: string[];

  @ApiPropertyOptional({
    type: [String],
    example: ['Basic computer skills', 'Text editor installed'],
  })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  requirements?: string[];

  @ApiPropertyOptional({
    type: [String],
    example: ['Beginners in web development', 'Career switchers'],
  })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  targetAudience?: string[];

  @ApiPropertyOptional({
    type: [String],
    example: ['Lifetime access', '30-day money back guarantee'],
  })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  features?: string[];
}

export class DateOptionDto {
  @ApiProperty({ example: '2025-11-06T13:44:37.064+00:00' })
  @IsDate()
  @Type(() => Date)
  date: Date;

  @ApiProperty({ example: 'Full Week , Weekend Per day' })
  @IsString()
  @IsOptional()
  description?: string; // e.g. "Full Week"

  @ApiProperty({ example: '9:00 AM - 4:30 PM (Eastern Time (GMT-5))' })
  @IsString()
  @IsOptional()
  time?: string;
}

export class CreateCourseDto {
  // ===== Basic Information =====
  @ApiProperty({
    description: 'The title of the course',
    example: 'Complete Web Development Bootcamp 2025',
  })
  @IsString()
  title: string;

  @ApiPropertyOptional({
    description:
      'URL-friendly slug (auto-generated from title if not provided)',
    example: 'complete-web-development-bootcamp-2025',
  })
  @IsString()
  @IsOptional()
  slug?: string;

  @ApiPropertyOptional({
    example: 'From Zero to Full-Stack Hero',
  })
  @IsString()
  @IsOptional()
  subtitle?: string;

  @ApiPropertyOptional({
    description: 'A detailed description of the course',
    example:
      'Master web development with HTML, CSS, JavaScript, React, Node.js and more',
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({
    description: 'The MongoDB ID of the instructor',
    example: '507f1f77bcf86cd799439011',
  })
  @IsMongoId()
  instructor: string;

  // ===== Category & Classification =====
  @ApiProperty({
    description: 'The category slug of the course',
    example: '690bc43d8ddd23690d42287e',
  })
  @IsMongoId()
  category: string;

  @ApiPropertyOptional({
    description: 'Array of subcategory names',
    example: ['Frontend Development', 'Backend Development'],
  })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  subcategories?: string[];

  @ApiPropertyOptional({
    description: 'Array of topic tags',
    example: ['HTML', 'CSS', 'JavaScript', 'React', 'Node.js'],
  })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  topics?: string[];

  // ===== Course Overview =====
  @ApiPropertyOptional({
    example:
      'This comprehensive course covers everything you need to become a full-stack developer...',
  })
  @IsString()
  @IsOptional()
  overview?: string;

  @ApiPropertyOptional({
    example: 'https://example.com/thumbnail.jpg',
  })
  @IsString()
  @IsOptional()
  thumbnailUrl?: string;

  @ApiPropertyOptional({
    example: 'https://example.com/preview-video.mp4',
  })
  @IsString()
  @IsOptional()
  previewVideoUrl?: string;

  // ===== Syllabus & Content =====
  @ApiPropertyOptional({
    type: [SessionDto],
    description: 'Course sessions/lectures',
  })
  @ValidateNested({ each: true })
  @Type(() => SessionDto)
  @IsArray()
  @IsOptional()
  sessions?: SessionDto[];

  // ===== Course Metadata =====
  @ApiPropertyOptional({ type: CourseSnapshotDto })
  @ValidateNested()
  @Type(() => CourseSnapshotDto)
  @IsOptional()
  snapshot?: CourseSnapshotDto;

  @ApiPropertyOptional({ type: CourseDetailsDto })
  @ValidateNested()
  @Type(() => CourseDetailsDto)
  @IsOptional()
  details?: CourseDetailsDto;

  @ApiPropertyOptional({ type: [FAQDto] })
  @ValidateNested({ each: true })
  @Type(() => FAQDto)
  @IsArray()
  @IsOptional()
  faqs?: FAQDto[];

  // ===== Pricing =====
  @ApiPropertyOptional({
    description: 'The price of the course',
    example: 199.99,
    minimum: 0,
  })
  @IsNumber()
  @Min(0)
  @IsOptional()
  price?: number;

  @ApiPropertyOptional({
    example: 149.99,
    minimum: 0,
  })
  @IsNumber()
  @Min(0)
  @IsOptional()
  discountedPrice?: number;

  @ApiPropertyOptional({
    example: 25,
    minimum: 0,
    maximum: 100,
  })
  @IsNumber()
  @Min(0)
  @Max(100)
  @IsOptional()
  discountPercentage?: number;

  @ApiPropertyOptional({
    enum: CurrencyEnum,
    example: CurrencyEnum.USD,
  })
  @IsEnum(CurrencyEnum)
  @IsOptional()
  currency?: CurrencyEnum;

  // ===== Stats & Engagement =====
  @ApiPropertyOptional({ example: 0 })
  @IsInt()
  @Min(0)
  @IsOptional()
  enrolledCount?: number;

  @ApiPropertyOptional({ example: 0, minimum: 0, maximum: 5 })
  @IsNumber()
  @Min(0)
  @Max(5)
  @IsOptional()
  averageRating?: number;

  @ApiPropertyOptional({ example: 0 })
  @IsInt()
  @Min(0)
  @IsOptional()
  totalReviews?: number;

  @ApiPropertyOptional({ example: 0 })
  @IsInt()
  @Min(0)
  @IsOptional()
  totalRatings?: number;

  // ===== Publishing & Status =====
  @ApiPropertyOptional({
    description: 'Whether the course is published',
    example: false,
  })
  @IsBoolean()
  @IsOptional()
  isPublished?: boolean;

  @ApiPropertyOptional({ example: false })
  @IsBoolean()
  @IsOptional()
  isFeatured?: boolean;

  @ApiPropertyOptional({ example: false })
  @IsBoolean()
  @IsOptional()
  isBestseller?: boolean;

  @ApiPropertyOptional({ example: true })
  @IsBoolean()
  @IsOptional()
  isNew?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  publishedAt?: Date;

  @ApiPropertyOptional()
  @IsOptional()
  lastUpdated?: Date;

  @ApiPropertyOptional({
    type: [DateOptionDto],
    description: 'Course time table/schedule',
  })
  @ValidateNested({ each: true })
  @Type(() => DateOptionDto)
  @IsArray()
  @IsOptional()
  timeTable?: DateOptionDto[];
}
