import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { now, HydratedDocument, Types } from 'mongoose';
import { EntityDocumentHelper } from '../../../../../utils/document-entity-helper';

export type CourseSchemaDocument = HydratedDocument<CourseSchemaClass>;

@Schema({
  timestamps: true,
  toJSON: {
    virtuals: true,
    getters: true,
  },
})
export class LessonSchemaClass {
  @Prop({
    type: String,
    required: true,
  })
  title: string;

  @Prop({ type: String })
  videoUrl?: string;

  @Prop({ type: String })
  content?: string;

  @Prop({ default: now })
  createdAt: Date;

  @Prop({ default: now })
  updatedAt: Date;
}

const LessonSchema = SchemaFactory.createForClass(LessonSchemaClass);

@Schema({
  timestamps: true,
  toJSON: {
    virtuals: true,
    getters: true,
  },
})
export class ModuleSchemaClass {
  @Prop({
    type: String,
    required: true,
  })
  title: string;

  @Prop({
    type: [LessonSchema],
    default: [],
  })
  lessons: LessonSchemaClass[];

  @Prop({ default: now })
  createdAt: Date;

  @Prop({ default: now })
  updatedAt: Date;
}

const ModuleSchema = SchemaFactory.createForClass(ModuleSchemaClass);

@Schema({
  timestamps: true,
  toJSON: {
    virtuals: true,
    getters: true,
  },
})
export class CourseSchemaClass extends EntityDocumentHelper {
  @Prop({
    type: String,
    required: true,
  })
  title: string;

  @Prop({ type: String })
  description?: string;

  @Prop({
    type: Types.ObjectId,
    ref: 'User',
    required: true,
  })
  instructor: Types.ObjectId;

  @Prop({
    type: [ModuleSchema],
    default: [],
  })
  modules: ModuleSchemaClass[];

  @Prop({
    type: Number,
    default: 0,
    min: 0,
  })
  price: number;

  @Prop({
    type: Number,
    default: 0,
    min: 0,
  })
  enrolledCount: number;

  @Prop({
    type: Boolean,
    default: true,
  })
  isPublished: boolean;

  @Prop({ default: now })
  createdAt: Date;

  @Prop({ default: now })
  updatedAt: Date;

  @Prop()
  deletedAt: Date;
}

export const CourseSchema = SchemaFactory.createForClass(CourseSchemaClass);

// Add indexes for frequently queried fields
CourseSchema.index({ instructor: 1 });
CourseSchema.index({ isPublished: 1 });
CourseSchema.index({ price: 1 });
CourseSchema.index({ createdAt: -1 });
