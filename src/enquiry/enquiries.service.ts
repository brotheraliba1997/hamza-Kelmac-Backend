import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  EnquirySchema,
  EnquirySchemaClass,
  EnquirySchemaDocument,
} from './schema/enquiry.schema';
import { CreateEnquiryDto } from './dto/create-enquiry.dto';
import { UpdateEnquiryDto } from './dto/update-enquiry.dto';
import { EnquiryEntity } from './domain/enquiry.entity';
import {
  buildMongooseQuery,
  FilterQueryBuilder,
  PaginationResult,
} from '../utils/mongoose-query-builder';
import { IPaginationOptions } from '../utils/types/pagination-options';
import { sanitizeMongooseDocument } from '../utils/convert-id';
import { FilterEnquiryDto, SortEnquiryDto } from './dto/query-enquiry.dto';
import { MailService } from '../mail/mail.service';
import { NotificationService } from '../notification/notification.service';
import { ConfigService } from '@nestjs/config';
import { AllConfigType } from '../config/config.type';

@Injectable()
export class EnquiriesService {
  constructor(
    @InjectModel(EnquirySchemaClass.name)
    private readonly enquiryModel: Model<EnquirySchemaDocument>,
    private readonly mailService: MailService,
    private readonly notificationService: NotificationService,
    private readonly configService: ConfigService<AllConfigType>,
  ) {}

  private map(doc: any): EnquiryEntity {
    if (!doc) return undefined as any;
    const s = sanitizeMongooseDocument(doc);
    if (!s) return undefined as any;
    return {
      id: s.id,
      subject: s.subject,
      name: s.name,
      email: s.email,
      phone: s.phone,
      company: s.company,
      designation: s.designation,
      enquiryType: s.enquiryType,
      scheme: s.scheme,
      trainingCategory: s.trainingCategory,
      trainingType: s.trainingType,
      trainingDelivery: s.trainingDelivery,
      numberOfLearners: s.numberOfLearners,
      preferredLearningDate: s.preferredLearningDate,
      organizationType: s.organizationType,
      language: s.language,
      certificationsHeld: s.certificationsHeld,
      delivery: s.delivery,
      numberOfLocations: s.numberOfLocations,
      hoursOfOperation: s.hoursOfOperation,
      certifiedScope: s.certifiedScope,
      auditingDelivery: s.auditingDelivery,
      industry: s.industry,
      createdAt: s.createdAt,
      updatedAt: s.updatedAt,
    } as EnquiryEntity;
  }

  async create(dto: CreateEnquiryDto): Promise<EnquiryEntity> {
    const created = await this.enquiryModel.create(dto);
    const entity = this.map(created.toObject());

    // Notify admin via email
    const adminEmail = this.configService.get('app.adminEmail', {
      infer: true,
    });
    if (adminEmail) {
      await this.mailService.enquirySubmitted({
        to: adminEmail,
        data: {
          subject: dto.subject,
          name: dto.name,
          email: dto.email,
          phone: dto.phone,
          company: dto.company,
          designation: dto.designation,
          industry: dto.industry,
          trainingType: dto.trainingType,
        },
      });
    }

    // Realtime notification to admin channel (basic event)
    this.notificationService.sendWelcome({
      type: 'enquiry',
      subject: dto.subject,
      name: dto.name,
      email: dto.email,
      at: new Date().toISOString(),
    });

    return entity;
  }

  async update(id: string, dto: UpdateEnquiryDto): Promise<EnquiryEntity> {
    const updated = await this.enquiryModel.findByIdAndUpdate(id, dto, {
      new: true,
    });
    if (!updated) throw new NotFoundException('Enquiry not found');
    return this.map(updated.toObject());
  }

  async findOne(id: string): Promise<EnquiryEntity | undefined> {
    const doc = await this.enquiryModel.findById(id).lean();
    return doc ? this.map(doc) : undefined;
  }

  async remove(id: string): Promise<{ message: string }> {
    const res = await this.enquiryModel.findByIdAndDelete(id);
    if (!res) throw new NotFoundException('Enquiry not found');
    return { message: 'Enquiry deleted successfully' };
  }

  async findManyWithPagination({
    filterOptions,
    sortOptions,
    paginationOptions,
  }: {
    filterOptions?: FilterEnquiryDto | null;
    sortOptions?: SortEnquiryDto[] | null;
    paginationOptions: IPaginationOptions;
  }): Promise<PaginationResult<EnquiryEntity>> {
    const filterQuery = new FilterQueryBuilder<EnquirySchemaClass>()
      .addEqual('subject' as any, filterOptions?.subject)
      .addEqual('name' as any, filterOptions?.name)
      .addEqual('email' as any, filterOptions?.email)
      .addEqual('phone' as any, filterOptions?.phone)
      .addEqual('company' as any, filterOptions?.company)
      .addEqual('designation' as any, filterOptions?.designation)
      .addEqual('enquiryType' as any, filterOptions?.enquiryType)
      .addEqual('scheme' as any, filterOptions?.scheme)
      .addEqual('trainingCategory' as any, filterOptions?.trainingCategory)
      .addEqual('trainingType' as any, filterOptions?.trainingType)
      .addEqual('trainingDelivery' as any, filterOptions?.trainingDelivery)
      .addEqual('organizationType' as any, filterOptions?.organizationType)
      .addEqual('language' as any, filterOptions?.language)
      .addEqual('certificationsHeld' as any, filterOptions?.certificationsHeld)
      .addEqual('delivery' as any, filterOptions?.delivery)
      .addEqual('certifiedScope' as any, filterOptions?.certifiedScope)
      .addEqual('auditingDelivery' as any, filterOptions?.auditingDelivery)
      .addEqual('industry' as any, filterOptions?.industry)
      .build();

    const additionalFilters: any = {};
    if (filterOptions?.search) {
      const regex = new RegExp(filterOptions.search, 'i');
      additionalFilters.$or = [
        { subject: regex },
        { name: regex },
        { email: regex },
        { company: regex },
        { designation: regex },
        { industry: regex },
      ];
    }

    const combinedFilter = { ...filterQuery, ...additionalFilters };

    return buildMongooseQuery({
      model: this.enquiryModel as any,
      filterQuery: combinedFilter,
      sortOptions,
      paginationOptions,
      populateFields: [],
      mapper: (doc) => this.map(doc),
    });
  }
}
