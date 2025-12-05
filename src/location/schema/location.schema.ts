import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { now, HydratedDocument } from 'mongoose';
import { EntityDocumentHelper } from '../../utils/document-entity-helper';

export type LocationSchemaDocument = HydratedDocument<LocationSchemaClass>;

@Schema({
  timestamps: true,
  toJSON: { virtuals: true, getters: true },
})
export class LocationSchemaClass extends EntityDocumentHelper {
  @Prop({ type: String, required: true, trim: true, index: true })
  country: string;

  @Prop({ type: String, trim: true, index: true })
  countryCode?: string;

  @Prop({ type: String, trim: true, index: true, default: 'usd' })
  currency?: string;
}

export const LocationSchema = SchemaFactory.createForClass(LocationSchemaClass);

LocationSchema.index({ country: 1 });
LocationSchema.index({ countryCode: 1 });

LocationSchema.index({
  country: 'text',
  countryCode: 'text',
});
