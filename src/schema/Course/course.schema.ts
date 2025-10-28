// course.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type CourseDocument = Course & Document;

@Schema({ timestamps: true })
export class Lesson {
  @Prop({ required: true })
  title: string;

  @Prop()
  videoUrl?: string;

  @Prop()
  content?: string;
}

const LessonSchema = SchemaFactory.createForClass(Lesson);

@Schema({ timestamps: true })
export class Module {
  @Prop({ required: true })
  title: string;

  @Prop({ type: [LessonSchema], default: [] })
  lessons: Lesson[];
}

const ModuleSchema = SchemaFactory.createForClass(Module);

@Schema({ timestamps: true })
export class Course {
  @Prop({ required: true })
  title: string;

  @Prop()
  description?: string;

  @Prop({ type: Types.ObjectId, ref: 'UserSchemaClass', required: true })
  instructor: Types.ObjectId;

  @Prop({ type: [ModuleSchema], default: [] })
  modules: Module[];

  @Prop({ default: 0 })
  price: number;

  @Prop({ default: 0 })
  enrolledCount: number;

  @Prop({ default: true })
  isPublished: boolean;
}

export const CourseSchema = SchemaFactory.createForClass(Course);
