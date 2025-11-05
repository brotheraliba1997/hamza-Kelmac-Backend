import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { now, HydratedDocument } from 'mongoose';
import { EntityDocumentHelper } from '../../utils/document-entity-helper';

export type CategorySchemaDocument = HydratedDocument<CategorySchemaClass>;

@Schema({
  timestamps: true,
  toJSON: { virtuals: true, getters: true },
})
export class CategorySchemaClass extends EntityDocumentHelper {
  @Prop({ type: String, required: true, trim: true, unique: true, index: true })
  name: string;

  @Prop({ type: String, required: true, trim: true, unique: true, index: true })
  slug: string;

  @Prop({ type: String, trim: true })
  description?: string;

  @Prop({ type: String, trim: true })
  icon?: string; // Icon URL or icon class name

  @Prop({ type: String, trim: true })
  image?: string; // Category image URL

  @Prop({ type: String })
  color?: string; // Hex color for UI

  @Prop({ type: [String], default: [], index: true })
  subcategories: string[]; // Array of subcategory names

  @Prop({ type: Number, default: 0, min: 0 })
  courseCount: number; // Number of courses in this category

  @Prop({ type: Number, default: 0, min: 0 })
  order: number; // Display order

  @Prop({ type: Boolean, default: true, index: true })
  isActive: boolean;

  @Prop({ type: Boolean, default: false })
  isFeatured: boolean;

  @Prop({ type: Date })
  deletedAt?: Date;
}

export const CategorySchema = SchemaFactory.createForClass(CategorySchemaClass);

// Indexes
CategorySchema.index({ name: 1, isActive: 1 });
CategorySchema.index({ slug: 1, isActive: 1 });
CategorySchema.index({ isFeatured: 1, isActive: 1 });
CategorySchema.index({ order: 1 });

// Text index for search
CategorySchema.index({ name: 'text', description: 'text' });
