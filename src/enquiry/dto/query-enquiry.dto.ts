import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsOptional, IsString, IsNumber, Min, IsEnum } from 'class-validator';
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

export class FilterEnquiryDto {
  @ApiPropertyOptional({ description: 'Filter by subject' })
  @IsOptional()
  @IsString()
  subject?: string;

  @ApiPropertyOptional({ description: 'Filter by name' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ description: 'Filter by email' })
  @IsOptional()
  @IsString()
  email?: string;

  @ApiPropertyOptional({ description: 'Filter by phone' })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiPropertyOptional({ description: 'Filter by company' })
  @IsOptional()
  @IsString()
  company?: string;

  @ApiPropertyOptional({ description: 'Filter by designation' })
  @IsOptional()
  @IsString()
  designation?: string;

  @ApiPropertyOptional({
    description: 'Filter by enquiry type',
    enum: EnquiryTypeEnum,
  })
  @IsOptional()
  @IsEnum(EnquiryTypeEnum)
  enquiryType?: string;

  @ApiPropertyOptional({ description: 'Filter by scheme', enum: SchemeEnum })
  @IsOptional()
  @IsEnum(SchemeEnum)
  scheme?: string;

  @ApiPropertyOptional({
    description: 'Filter by training category',
    enum: TrainingCategoryEnum,
  })
  @IsOptional()
  @IsEnum(TrainingCategoryEnum)
  trainingCategory?: string;

  @ApiPropertyOptional({
    description: 'Filter by training type',
    enum: TrainingTypeEnum,
  })
  @IsOptional()
  @IsEnum(TrainingTypeEnum)
  trainingType?: string;

  @ApiPropertyOptional({
    description: 'Filter by training delivery',
    enum: TrainingDeliveryEnum,
  })
  @IsOptional()
  @IsEnum(TrainingDeliveryEnum)
  trainingDelivery?: string;

  @ApiPropertyOptional({
    description: 'Filter by organization type',
    enum: OrganizationTypeEnum,
  })
  @IsOptional()
  @IsEnum(OrganizationTypeEnum)
  organizationType?: string;

  @ApiPropertyOptional({
    description: 'Filter by language',
    enum: LanguageEnum,
  })
  @IsOptional()
  @IsEnum(LanguageEnum)
  language?: string;

  @ApiPropertyOptional({
    description: 'Filter by certifications held',
    enum: CertificationEnum,
  })
  @IsOptional()
  @IsEnum(CertificationEnum)
  certificationsHeld?: string;

  @ApiPropertyOptional({
    description: 'Filter by delivery',
    enum: DeliveryEnum,
  })
  @IsOptional()
  @IsEnum(DeliveryEnum)
  delivery?: string;

  @ApiPropertyOptional({
    description: 'Filter by certified scope',
    enum: CertifiedScopeEnum,
  })
  @IsOptional()
  @IsEnum(CertifiedScopeEnum)
  certifiedScope?: string;

  @ApiPropertyOptional({
    description: 'Filter by auditing delivery',
    enum: AuditingDeliveryEnum,
  })
  @IsOptional()
  @IsEnum(AuditingDeliveryEnum)
  auditingDelivery?: string;

  @ApiPropertyOptional({ description: 'Filter by industry' })
  @IsOptional()
  @IsString()
  industry?: string;

  @ApiPropertyOptional({
    description: 'Free text search across multiple fields',
  })
  @IsOptional()
  @IsString()
  search?: string;
}

export class SortEnquiryDto {
  @ApiPropertyOptional({
    description: 'Field to sort by',
    enum: [
      'createdAt',
      'updatedAt',
      'subject',
      'name',
      'email',
      'company',
      'numberOfLearners',
      'preferredLearningDate',
    ],
  })
  @IsOptional()
  @IsString()
  orderBy?: string;

  @ApiPropertyOptional({ description: 'Sort order', enum: ['ASC', 'DESC'] })
  @IsOptional()
  @IsString()
  order?: 'ASC' | 'DESC';
}

export class QueryEnquiryDto {
  @ApiPropertyOptional({ example: 1, description: 'Page number' })
  @IsOptional()
  @Transform(({ value }) => (value ? Number(value) : 1))
  @IsNumber()
  @Min(1)
  page?: number;

  @ApiPropertyOptional({ example: 10, description: 'Items per page' })
  @IsOptional()
  @Transform(({ value }) => (value ? Number(value) : 10))
  @IsNumber()
  @Min(1)
  limit?: number;
}
