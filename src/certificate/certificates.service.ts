// certificates.service.ts
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { CreateCertificateDto } from './dto/create-certificate.dto';
import { UpdateCertificateDto } from './dto/update-certificate.dto';
import { CertificateSchemaClass } from './schema/certificate.schema';
import {
  buildMongooseQuery,
  FilterQueryBuilder,
  SortOption,
} from '../utils/mongoose-query-builder';
import { IPaginationOptions } from '../utils/types/pagination-options';

@Injectable()
export class CertificatesService {
  constructor(
    @InjectModel(CertificateSchemaClass.name)
    private model: Model<CertificateSchemaClass>,
  ) {}

  private map(raw: CertificateSchemaClass): any {
    return {
      id: raw._id?.toString(),
      user: raw.user,
      course: raw.course,
      certificateUrl: raw.certificateUrl,
      createdAt: raw.createdAt,
      updatedAt: raw.updatedAt,
      deletedAt: raw.deletedAt,
    };
  }

  async create(dto: CreateCertificateDto) {
    const certificate = await this.model.create(dto);
    return this.map(await certificate.save());
  }

  async findManyWithPagination({
    filterOptions,
    sortOptions,
    paginationOptions,
  }: {
    filterOptions?: {
      userId?: string;
      courseId?: string;
    };
    sortOptions?: SortOption[];
    paginationOptions: IPaginationOptions;
  }) {
    const filterQuery = new FilterQueryBuilder<CertificateSchemaClass>()
      .addEqual('user', filterOptions?.userId)
      .addEqual('course', filterOptions?.courseId)
      .build();

    return buildMongooseQuery({
      model: this.model,
      filterQuery,
      sortOptions,
      paginationOptions,
      populateFields: [
        { path: 'user', select: 'firstName lastName email' },
        { path: 'course', select: 'title description' },
      ],
      mapper: this.map.bind(this),
    });
  }

  async findAll() {
    const certificates = await this.model
      .find()
      .populate('user', 'firstName lastName email')
      .populate('course', 'title description')
      .lean();
    return certificates.map(this.map.bind(this));
  }

  async findOne(id: string) {
    const certificate = await this.model
      .findById(id)
      .populate('user', 'firstName lastName email')
      .populate('course', 'title description')
      .lean();
    return certificate ? this.map(certificate) : null;
  }

  async update(id: string, dto: UpdateCertificateDto) {
    const certificate = await this.model
      .findByIdAndUpdate(id, dto, { new: true })
      .lean();
    return certificate ? this.map(certificate) : null;
  }

  async remove(id: string) {
    const certificate = await this.model.findByIdAndDelete(id).lean();
    return certificate ? this.map(certificate) : null;
  }
}
