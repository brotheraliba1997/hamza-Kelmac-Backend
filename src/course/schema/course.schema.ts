import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { now, HydratedDocument, Types } from 'mongoose';
import { EntityDocumentHelper } from '../../utils/document-entity-helper';
import { UserSchemaClass } from '../../users/schema/user.schema';

export type CourseSchemaDocument = HydratedDocument<CourseSchemaClass>;

// Enums for better type safety
export enum SessionTypeEnum {
  LECTURE = 'lecture',
  INTRODUCTION = 'introduction',
  BREAK = 'break',
  LUNCH = 'lunch',
  END_OF_DAY = 'end_of_day',
}

export enum SkillLevelEnum {
  BEGINNER = 'Beginner',
  INTERMEDIATE = 'Intermediate',
  ADVANCED = 'Advanced',
  ALL_LEVELS = 'All Levels',
}

export enum CurrencyEnum {
  USD = 'USD',
  EUR = 'EUR',
  GBP = 'GBP',
  INR = 'INR',
}

// =====================================================
// SUB-SCHEMAS
// =====================================================

// FAQ Schema
@Schema({
  timestamps: false,
  toJSON: { virtuals: true, getters: true },
  _id: false,
})
export class FAQSchemaClass {
  @Prop({ type: String, required: true, trim: true })
  question: string;

  @Prop({ type: String, required: true, trim: true })
  answer: string;
}

const FAQSchema = SchemaFactory.createForClass(FAQSchemaClass);

export class ClassDateOptionSchemaClass {
  @Prop({ type: Date, required: true })
  date: Date;

  @Prop({ type: String, required: true, trim: true })
  description: string;

  @Prop({ type: String, required: true, trim: true })
  time?: string;
}

const ClassDateSchema = SchemaFactory.createForClass(
  ClassDateOptionSchemaClass,
);

// Topic Item Schema (Individual topics within a session)
@Schema({
  timestamps: false,
  toJSON: { virtuals: true, getters: true },
  _id: false,
})
export class TopicItemSchemaClass {
  @Prop({ type: String, required: true, trim: true })
  title: string;

  @Prop({ type: String, default: '', trim: true })
  description?: string;

  @Prop({ type: Boolean, default: false })
  isCompleted: boolean;

  @Prop({ type: Number, min: 0 })
  order?: number;
}

const TopicItemSchema = SchemaFactory.createForClass(TopicItemSchemaClass);

// Session Schema (Lessons, Lectures, Breaks)
@Schema({
  timestamps: true,
  toJSON: { virtuals: true, getters: true },
})
export class SessionSchemaClass {
  @Prop({ type: String, required: true, trim: true })
  title: string;

  @Prop({ type: String, trim: true })
  description?: string;

  @Prop({
    type: String,
    enum: Object.values(SessionTypeEnum),
    default: SessionTypeEnum.LECTURE,
  })
  sessionType: string;

  @Prop({ type: String, match: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/ })
  startTime?: string; // Format: HH:MM (24-hour)

  @Prop({ type: String, match: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/ })
  endTime?: string; // Format: HH:MM (24-hour)

  @Prop({ type: String, trim: true })
  videoUrl?: string;

  @Prop({ type: String })
  content?: string;

  @Prop({ type: Number, default: 0, min: 0 })
  duration: number; // Duration in minutes

  @Prop({ type: Boolean, default: false })
  isFree: boolean; // Free preview access

  @Prop({ type: Boolean, default: false })
  isBreak: boolean; // Break/lunch session

  @Prop({ type: [TopicItemSchema], default: [] })
  topics: TopicItemSchemaClass[];

  

  @Prop({ type: [String], default: [] })
  resources: string[]; // Resource URLs

  @Prop({ type: String, match: /^#[0-9A-F]{6}$/i })
  color?: string; // Hex color code

  @Prop({ type: Number, default: 0, min: 0 })
  order: number; // Display order

  @Prop({ type: String, trim: true })
  dayGroup?: string; // e.g., "DAY 01"

  @Prop({ type: Number, min: 1 })
  dayNumber?: number; // e.g., 1, 2, 3
}

const SessionSchema = SchemaFactory.createForClass(SessionSchemaClass);

// Course Snapshot Schema
@Schema({
  timestamps: false,
  toJSON: { virtuals: true, getters: true },
  _id: false,
})
export class CourseSnapshotSchemaClass {
  @Prop({ type: Number, default: 0, min: 0 })
  totalLectures: number;

  @Prop({ type: Number, default: 0, min: 0 })
  totalDuration: number; // In hours

  @Prop({
    type: String,
    enum: Object.values(SkillLevelEnum),
    default: SkillLevelEnum.ALL_LEVELS,
  })
  skillLevel: string;

  @Prop({ type: String, default: 'English', trim: true })
  language: string;

  @Prop({ type: String, trim: true })
  captionsLanguage?: string;

  @Prop({ type: Number, default: 0, min: 0 })
  enrolledStudents: number;

  @Prop({ type: Boolean, default: true })
  certificate: boolean;

  @Prop({ type: Boolean, default: true })
  lifetimeAccess: boolean;

  @Prop({ type: Boolean, default: true })
  mobileAccess: boolean;
}

const CourseSnapshotSchema = SchemaFactory.createForClass(
  CourseSnapshotSchemaClass,
);

// Course Details Schema
@Schema({
  timestamps: false,
  toJSON: { virtuals: true, getters: true },
  _id: false,
})
export class CourseDetailsSchemaClass {
  @Prop({ type: [String], default: [] })
  whatYouWillLearn: string[]; // Learning objectives

  @Prop({ type: [String], default: [] })
  requirements: string[]; // Prerequisites

  @Prop({ type: [String], default: [] })
  targetAudience: string[]; // Who this course is for

  @Prop({ type: [String], default: [] })
  features: string[]; // Course features
}

const CourseDetailsSchema = SchemaFactory.createForClass(
  CourseDetailsSchemaClass,
);

// =====================================================
// MAIN COURSE SCHEMA
// =====================================================

@Schema({
  timestamps: true,
  toJSON: { virtuals: true, getters: true },
})
export class CourseSchemaClass extends EntityDocumentHelper {
  // ===== Basic Information =====
  @Prop({ type: String, required: true, trim: true, index: true })
  title: string;

  @Prop({ type: String, required: true, unique: true, trim: true, index: true })
  slug: string;

  @Prop({ type: String, trim: true })
  subtitle?: string;

  @Prop({ type: String })
  description?: string;

  @Prop({
    type: Types.ObjectId,
    ref: UserSchemaClass.name,
    required: true,
    index: true,
  })
  instructor: Types.ObjectId;

  // ===== Category & Classification =====
  @Prop({ type: String, required: true, trim: true, index: true })
  category: string;

  @Prop({ type: [String], default: [], index: true })
  subcategories: string[];

  @Prop({ type: [String], default: [], index: true })
  topics: string[];

  // ===== Course Overview =====
  @Prop({ type: String })
  overview?: string;

  @Prop({ type: String, trim: true })
  thumbnailUrl?: string;

  @Prop({ type: String, trim: true })
  previewVideoUrl?: string;

  // ===== Syllabus & Content =====
  @Prop({ type: [SessionSchema], default: [] })
  sessions: SessionSchemaClass[];

  // ===== Course Metadata =====
  @Prop({ type: CourseSnapshotSchema, default: () => ({}) })
  snapshot: CourseSnapshotSchemaClass;

  @Prop({ type: CourseDetailsSchema, default: () => ({}) })
  details: CourseDetailsSchemaClass;

  @Prop({ type: [FAQSchema], default: [] })
  faqs: FAQSchemaClass[];

  // ===== Pricing =====
  @Prop({ type: Number, default: 0, min: 0, index: true })
  price: number;

  @Prop({ type: Number, min: 0 })
  discountedPrice?: number;

  @Prop({ type: Number, min: 0, max: 100 })
  discountPercentage?: number;

  @Prop({
    type: String,
    enum: Object.values(CurrencyEnum),
    default: CurrencyEnum.USD,
  })
  currency: string;

  // ===== Stats & Engagement =====
  @Prop({ type: Number, default: 0, min: 0, index: true })
  enrolledCount: number;

  @Prop({ type: Number, default: 0, min: 0, max: 5, index: true })
  averageRating: number;

  @Prop({ type: Number, default: 0, min: 0 })
  totalReviews: number;

  @Prop({ type: Number, default: 0, min: 0 })
  totalRatings: number;

  // ===== Publishing & Status =====
  @Prop({ type: Boolean, default: false, index: true })
  isPublished: boolean;

  @Prop({ type: Boolean, default: false, index: true })
  isFeatured: boolean;

  @Prop({ type: Boolean, default: false, index: true })
  isBestseller: boolean;

  @Prop({ type: Boolean, default: false })
  isNew: boolean;

  @Prop({ type: Date })
  publishedAt?: Date;

  @Prop({ type: Date })
  lastUpdated?: Date;


  @Prop({ type: [ClassDateSchema], default: [] })
  timeTable: ClassDateOptionSchemaClass[];

  // ===== Timestamps =====
  @Prop({ type: Date })
  deletedAt?: Date;
}

export const CourseSchema = SchemaFactory.createForClass(CourseSchemaClass);

// =====================================================
// INDEXES
// =====================================================

// Compound indexes for better query performance
CourseSchema.index({ isPublished: 1, isFeatured: 1, isBestseller: 1 });
CourseSchema.index({ category: 1, subcategories: 1 });
CourseSchema.index({ averageRating: -1, enrolledCount: -1 });
CourseSchema.index({ instructor: 1, isPublished: 1 });
CourseSchema.index({ createdAt: -1 });

// Text index for search
CourseSchema.index({
  title: 'text',
  description: 'text',
  category: 'text',
  subcategories: 'text',
});
