import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { now, HydratedDocument, Types } from 'mongoose';
import { EntityDocumentHelper } from '../../utils/document-entity-helper';
import { UserSchemaClass } from '../../users/schema/user.schema';
import { CategorySchemaClass } from '../../category';
import { LocationSchemaClass } from '../../location/schema/location.schema';

export type CourseSchemaDocument = HydratedDocument<CourseSchemaClass>;

// Enums for better type safety
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

@Schema({
  timestamps: false,
  toJSON: { virtuals: true, getters: true },
  // _id: false,
})
export class ClassDateOptionSchemaClass {
  @Prop({ type: Date, required: true })
  date: Date;

  @Prop({ type: String, required: true, trim: true })
  description: string;

  @Prop({ type: String, required: true, trim: true })
  time?: string;
}

const ClassDateOptionSchema = SchemaFactory.createForClass(
  ClassDateOptionSchemaClass,
);

// Time Block Schema (detailed schedule entries)
@Schema({
  timestamps: false,
  toJSON: { virtuals: true, getters: true },
  _id: false,
})
export class TimeBlockSchemaClass {
  @Prop({ type: String, required: true, trim: true })
  startDate: string;

  @Prop({ type: String, required: true, trim: true })
  endDate: string;

  @Prop({ type: String, required: true, trim: true })
  startTime: string;

  @Prop({ type: String, required: true, trim: true })
  endTime: string;

  @Prop({
    type: String,
    default: 'Eastern Time (GMT-5)',
    trim: true,
  })
  timeZone: string;
}

const TimeBlockSchema = SchemaFactory.createForClass(TimeBlockSchemaClass);

export enum SessionFormatEnum {
  FULL_WEEK = 'Full Week',
  SPLIT_WEEK = 'Split Week',
  WEEKEND = 'Weekend',
  EVENING = 'Evening',
}

// Session Schema (High-level course session definition)
@Schema({
  timestamps: true,
  toJSON: { virtuals: true, getters: true },
})
export class SessionSchemaClass {
  @Prop({
    type: String,
    enum: Object.values(SessionFormatEnum),
    required: true,
    trim: true,
  })
  type: string;

  @Prop({
    type: Types.ObjectId,
    ref: LocationSchemaClass.name,
    required: true,
    index: true,
  })
  location: Types.ObjectId;

  @Prop({ type: String, default: 'online', enum: ['online', 'in-person'] })
  mode: 'online' | 'in-person';

  @Prop({
    type: Types.ObjectId,
    ref: UserSchemaClass.name,
    required: true,
    index: true,
  })
  instructor: Types.ObjectId;

  @Prop({ type: [TimeBlockSchema], default: [] })
  timeBlocks: TimeBlockSchemaClass[];

  @Prop({ type: Number, default: 0, min: 0 })
  seatsLeft: number;
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

// schema for course
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
    ref: CategorySchemaClass.name,
    required: true,
    index: true,
  })
  category: Types.ObjectId;

  @Prop({ type: Boolean, default: false })
  hasTest: boolean;

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
  // ===== Schedule & Timetable =====
  @Prop({ type: [ClassDateOptionSchema], default: [] })
  timeTable: ClassDateOptionSchemaClass[];

  // @Prop({ type: [ClassDateSchema], default: [] })
  // timeTable: ClassDateOptionSchemaClass[];

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
