import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { now, HydratedDocument, Types } from 'mongoose';
import { EntityDocumentHelper } from '../../utils/document-entity-helper';
import { UserSchemaClass } from '../../users/schema/user.schema';

export type BlogSchemaDocument = HydratedDocument<BlogSchemaClass>;

@Schema({
  timestamps: true,
  toJSON: {
    virtuals: true,
    versionKey: false,
    transform: (_, ret) => {
      ret._id = ret._id.toString();
      delete ret._id;
    },
  },
  toObject: {
    virtuals: true,
    versionKey: false,
    transform: (_, ret) => {
      ret._id = ret._id.toString();
      delete ret._id;
    },
  },
})
export class BlogSchemaClass extends EntityDocumentHelper {
  @Prop({
    type: String,
    required: true,
  })
  title: string;

  @Prop({
    type: String,
    required: true,
  })
  content: string;

  @Prop({
    type: Types.ObjectId,
    ref: UserSchemaClass.name,
    required: true,
  })
  author: Types.ObjectId;

  @Prop({
    type: [String],
    default: [],
  })
  comments: string[];

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

export const BlogSchema = SchemaFactory.createForClass(BlogSchemaClass);

// Add indexes for frequently queried fields
BlogSchema.index({ author: 1 });
BlogSchema.index({ isPublished: 1 });
BlogSchema.index({ createdAt: -1 });
