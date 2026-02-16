import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';
import { Document, Types } from 'mongoose';
import { EntityDocumentHelper } from '../../utils/document-entity-helper';
import { CourseSchemaClass } from '../../course/schema/course.schema';

@Schema({ timestamps: true })
export class BundleOffer extends EntityDocumentHelper {
  @ApiProperty({
    description: 'Bundle title',
    example: 'Quality Management Bundle',
  })
  @Prop({ type: String, required: true, trim: true })
  title: string;

  @ApiProperty({
    description: 'Bundle description',
    example: 'Get all quality courses at discounted price',
    required: false,
  })
  @Prop({ type: String, trim: true })
  description?: string;

  @ApiProperty({
    description: 'Array of course IDs included in the bundle',
    type: 'array',
    items: { type: 'string', example: '507f1f77bcf86cd799439011' },
  })
  @Prop({
    type: [{ type: Types.ObjectId, ref: CourseSchemaClass.name }],
    required: true,
  })
  courses: Types.ObjectId[];

  @ApiProperty({ description: 'Sum of original course prices', example: 299 })
  @Prop({ type: Number, required: true, min: 0 })
  originalPrice: number;

  @ApiProperty({ description: 'Discounted bundle price', example: 199 })
  @Prop({ type: Number, required: true, min: 0 })
  bundlePrice: number;

  @ApiProperty({ description: 'Whether bundle is active', example: true })
  @Prop({ type: Boolean, default: true })
  isActive: boolean;

  @ApiProperty({
    description: 'Optional expiration date',
    example: '2025-12-31',
    required: false,
  })
  @Prop({ type: Date, default: null })
  expiresAt?: Date | null;
}

export type BundleOfferDocument = BundleOffer & Document;

export const BundleOfferSchema = SchemaFactory.createForClass(BundleOffer);
