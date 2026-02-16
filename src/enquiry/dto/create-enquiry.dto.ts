import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEmail,
  IsOptional,
  IsString,
  IsEnum,
  IsNumber,
  IsDateString,
} from 'class-validator';
import { Type } from 'class-transformer';
import {
  SchemeEnum,
  TrainingCategoryEnum,
  TrainingTypeEnum,
  TrainingDeliveryEnum,
  OrganizationTypeEnum,
  LanguageEnum,
  CertificationEnum,
  DeliveryEnum,
  LocationRangeEnum,
  HoursOfOperationEnum,
  CertifiedScopeEnum,
  AuditingDeliveryEnum,
  EnquiryTypeEnum,
} from '../schema/enquiry.schema';

export class CreateEnquiryDto {
  // Core fields
  @ApiProperty({ description: 'Subject of the enquiry' })
  @IsString()
  subject: string;

  @ApiProperty({ description: 'Full name of the requester' })
  @IsString()
  name: string;

  @ApiProperty({ description: 'Email of the requester' })
  @IsEmail()
  email: string;

  @ApiPropertyOptional({ description: 'Phone number of the requester' })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiPropertyOptional({ description: 'Company name' })
  @IsOptional()
  @IsString()
  company?: string;

  @ApiPropertyOptional({ description: 'Designation/role at the company' })
  @IsOptional()
  @IsString()
  designation?: string;

  // Enquiry type
  @ApiPropertyOptional({
    description: 'Type of enquiry',
    enum: EnquiryTypeEnum,
  })
  @IsOptional()
  @IsEnum(EnquiryTypeEnum)
  enquiryType?: string;

  // Scheme selection
  @ApiPropertyOptional({
    description: 'Certification scheme',
    enum: SchemeEnum,
  })
  @IsOptional()
  @IsEnum(SchemeEnum)
  scheme?: string;

  // Training fields
  @ApiPropertyOptional({
    description: 'Training category',
    enum: TrainingCategoryEnum,
  })
  @IsOptional()
  @IsEnum(TrainingCategoryEnum)
  trainingCategory?: string;

  @ApiPropertyOptional({
    description: 'Training type',
    enum: TrainingTypeEnum,
  })
  @IsOptional()
  @IsEnum(TrainingTypeEnum)
  trainingType?: string;

  @ApiPropertyOptional({
    description: 'Training delivery method',
    enum: TrainingDeliveryEnum,
  })
  @IsOptional()
  @IsEnum(TrainingDeliveryEnum)
  trainingDelivery?: string;

  @ApiPropertyOptional({
    description: 'Number of learners',
    example: 1,
  })
  @IsOptional()
  @IsNumber()
  numberOfLearners?: number;

  @ApiPropertyOptional({
    description: 'Preferred learning event date',
    example: '2025-01-15',
    type: String,
  })
  @IsOptional()
  @IsString()
  preferredLearningDate?: string;

  // Organization details
  @ApiPropertyOptional({
    description: 'Organization type',
    enum: OrganizationTypeEnum,
  })
  @IsOptional()
  @IsEnum(OrganizationTypeEnum)
  organizationType?: string;

  @ApiPropertyOptional({
    description: 'Language preference',
    enum: LanguageEnum,
  })
  @IsOptional()
  @IsEnum(LanguageEnum)
  language?: string;

  @ApiPropertyOptional({
    description: 'Certifications held',
    enum: CertificationEnum,
  })
  @IsOptional()
  @IsEnum(CertificationEnum)
  certificationsHeld?: string;

  @ApiPropertyOptional({
    description: 'Delivery preference',
    enum: DeliveryEnum,
  })
  @IsOptional()
  @IsEnum(DeliveryEnum)
  delivery?: string;

  @ApiPropertyOptional({
    description: 'Number of locations/suppliers',
    enum: LocationRangeEnum,
  })
  @IsOptional()
  @IsEnum(LocationRangeEnum)
  numberOfLocations?: string;

  @ApiPropertyOptional({
    description: 'Hours of operation',
    enum: HoursOfOperationEnum,
  })
  @IsOptional()
  @IsEnum(HoursOfOperationEnum)
  hoursOfOperation?: string;

  @ApiPropertyOptional({
    description: 'Certified scope',
    enum: CertifiedScopeEnum,
  })
  @IsOptional()
  @IsEnum(CertifiedScopeEnum)
  certifiedScope?: string;

  @ApiPropertyOptional({
    description: 'Auditing delivery method',
    enum: AuditingDeliveryEnum,
  })
  @IsOptional()
  @IsEnum(AuditingDeliveryEnum)
  auditingDelivery?: string;

  // Legacy field
  @ApiPropertyOptional({ description: 'Industry of the requester' })
  @IsOptional()
  @IsString()
  industry?: string;
}
