import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { EntityDocumentHelper } from '../../utils/document-entity-helper';

export type EnquirySchemaDocument = HydratedDocument<EnquirySchemaClass>;

// Enums for select fields
export enum SchemeEnum {
  ISO_9001_2015 = 'ISO 9001:2015 - Quality Management',
  ISO_14001_2015 = 'ISO 14001:2015 - Environmental Management',
  ISO_45001_2018 = 'ISO 45001:2018 - Occupational Health & Safety',
  ISO_27001_2013 = 'ISO 27001:2013 - Information Security',
  FSSC_22000 = 'FSSC 22000 - Food Safety System Certification',
  ISO_13485_2016 = 'ISO 13485:2016 - Medical Devices',
  IATF_16949_2016 = 'IATF 16949:2016 - Automotive Quality Management',
}

export enum TrainingCategoryEnum {
  FUNDAMENTALS = 'Fundamentals/Awareness',
  INTERNAL_AUDITOR = 'Internal Auditor',
  LEAD_AUDITOR = 'Lead Auditor',
  IMPLEMENTATION = 'Implementation',
  TRANSITION = 'Transition/Upgrade',
  ADVANCED = 'Advanced/Specialist',
}

export enum TrainingTypeEnum {
  FOUNDATION = 'Foundation Course',
  INTERNAL_AUDITOR = 'Internal Auditor Training',
  LEAD_AUDITOR = 'Lead Auditor Training',
  MANAGEMENT_REP = 'Management Representative Training',
  ADVANCED_AUDITING = 'Advanced Auditing Techniques',
  RISK_THINKING = 'Risk-Based Thinking Workshop',
  DOCUMENT_CONTROL = 'Document Control Training',
}

export enum TrainingDeliveryEnum {
  VIRTUAL_LIVE = 'Virtual Live (Online)',
  CLASSROOM = 'Classroom (On-site)',
  HYBRID = 'Hybrid (Blended Learning)',
  SELF_PACED = 'Self-paced eLearning',
  ON_DEMAND = 'On-demand Recorded Sessions',
}

export enum OrganizationTypeEnum {
  PRIVATE = 'Private',
  PUBLIC = 'Public',
  NON_PROFIT = 'Non-Profit',
}

export enum LanguageEnum {
  ENGLISH = 'English',
  FRENCH = 'French',
  GERMAN = 'German',
}

export enum CertificationEnum {
  ISO_9001 = 'ISO 9001',
  ISO_14001 = 'ISO 14001',
  NONE = 'None',
}

export enum DeliveryEnum {
  ON_SITE = 'On-site',
  ONLINE = 'Online',
  HYBRID = 'Hybrid',
}

export enum LocationRangeEnum {
  SMALL = '1-5',
  MEDIUM = '6-10',
  LARGE = '10+',
}

export enum HoursOfOperationEnum {
  NINE_TO_FIVE = '9-5',
  TWENTY_FOUR_SEVEN = '24/7',
  FLEXIBLE = 'Flexible',
}

export enum CertifiedScopeEnum {
  LOCAL = 'Local',
  INTERNATIONAL = 'International',
}

export enum AuditingDeliveryEnum {
  INTERNAL = 'Internal',
  EXTERNAL = 'External',
}

export enum EnquiryTypeEnum {
  AUDITING = 'auditing',
  CONSULTING = 'consulting',
  TRAINING = 'training',
  OTHER = 'other',
}

@Schema({
  timestamps: true,
  toJSON: { virtuals: true, getters: true },
})
export class EnquirySchemaClass extends EntityDocumentHelper {
  // Core fields
  @Prop({ type: String, required: true, trim: true, index: true })
  subject: string;

  @Prop({ type: String, required: true, trim: true, index: true })
  name: string;

  @Prop({ type: String, required: true, trim: true, index: true })
  email: string;

  @Prop({ type: String, trim: true, index: true })
  phone?: string;

  @Prop({ type: String, trim: true, index: true })
  company?: string;

  @Prop({ type: String, trim: true, index: true })
  designation?: string;

  // Enquiry type
  @Prop({
    type: String,
    trim: true,
    index: true,
    enum: Object.values(EnquiryTypeEnum),
  })
  enquiryType?: string;

  // Scheme selection
  @Prop({
    type: String,
    trim: true,
    index: true,
    enum: Object.values(SchemeEnum),
  })
  scheme?: string;

  // Training fields
  @Prop({
    type: String,
    trim: true,
    index: true,
    enum: Object.values(TrainingCategoryEnum),
  })
  trainingCategory?: string;

  @Prop({
    type: String,
    trim: true,
    index: true,
    enum: Object.values(TrainingTypeEnum),
  })
  trainingType?: string;

  @Prop({
    type: String,
    trim: true,
    index: true,
    enum: Object.values(TrainingDeliveryEnum),
  })
  trainingDelivery?: string;

  @Prop({ type: Number, default: 1 })
  numberOfLearners?: number;

  @Prop({ type: Date })
  preferredLearningDate?: Date;

  // Organization details
  @Prop({
    type: String,
    trim: true,
    index: true,
    enum: Object.values(OrganizationTypeEnum),
  })
  organizationType?: string;

  @Prop({
    type: String,
    trim: true,
    index: true,
    enum: Object.values(LanguageEnum),
  })
  language?: string;

  @Prop({
    type: String,
    trim: true,
    index: true,
    enum: Object.values(CertificationEnum),
  })
  certificationsHeld?: string;

  @Prop({
    type: String,
    trim: true,
    index: true,
    enum: Object.values(DeliveryEnum),
  })
  delivery?: string;

  @Prop({
    type: String,
    trim: true,
    index: true,
    enum: Object.values(LocationRangeEnum),
  })
  numberOfLocations?: string;

  @Prop({
    type: String,
    trim: true,
    index: true,
    enum: Object.values(HoursOfOperationEnum),
  })
  hoursOfOperation?: string;

  @Prop({
    type: String,
    trim: true,
    index: true,
    enum: Object.values(CertifiedScopeEnum),
  })
  certifiedScope?: string;

  @Prop({
    type: String,
    trim: true,
    index: true,
    enum: Object.values(AuditingDeliveryEnum),
  })
  auditingDelivery?: string;

  // Legacy fields (kept for backward compatibility)
  @Prop({ type: String, trim: true, index: true })
  industry?: string;

  @Prop({
    type: String,
    trim: true,
    index: true,
    enum: ['pending', 'replied', 'closed', 'in-progress', 'on-hold'],
  })
  status?: string;

  @Prop({ type: Boolean, default: true })
  isActive?: boolean;

  @Prop({ type: Boolean, default: false })
  isDeleted?: boolean;
}

export const EnquirySchema = SchemaFactory.createForClass(EnquirySchemaClass);

// Helpful indexes
EnquirySchema.index({ email: 1 });
EnquirySchema.index({ phone: 1 });
EnquirySchema.index({ subject: 1 });
EnquirySchema.index({ name: 1 });

// Text index for search across multiple fields
EnquirySchema.index({
  subject: 'text',
  industry: 'text',
  trainingType: 'text',
  name: 'text',
  email: 'text',
  phone: 'text',
  company: 'text',
  designation: 'text',
});
