import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  LocationSchemaClass,
  LocationSchemaDocument,
} from './schema/location.schema';
import { LocationEntity } from './location.entity';
import { sanitizeMongooseDocument } from '../utils/convert-id';
import { IPaginationOptions } from '../utils/types/pagination-options';
import {
  buildMongooseQuery,
  FilterQueryBuilder,
  PaginationResult,
} from '../utils/mongoose-query-builder';
import { FilterLocationDto, SortLocationDto } from './dto/query-location.dto';

@Injectable()
export class LocationService {
  constructor(
    @InjectModel(LocationSchemaClass.name)
    private readonly locationModel: Model<LocationSchemaDocument>,
  ) {}
  private map(doc: any): LocationEntity {
    if (!doc) return undefined as any;

    // Sanitize the document to convert all IDs and nested objects
    const sanitized = sanitizeMongooseDocument(doc);

    // Double-check sanitized is not null
    if (!sanitized) return undefined as any;

    const entity = new LocationEntity();
    entity.id = sanitized.id;
    entity.country = sanitized.country;
    entity.countryCode = sanitized.countryCode;
    entity.currency = sanitized.currency;
    entity.createdAt = sanitized.createdAt;
    entity.updatedAt = sanitized.updatedAt;
    return entity;
  }

  async create(data: Partial<LocationEntity>): Promise<LocationEntity> {
    const sanitized = sanitizeMongooseDocument(data);
    const created = await this.locationModel.create(sanitized);
    return this.map(created.toObject());
  }

  //   sanitizeData(data: Partial<LocationEntity>): Partial<LocationEntity> {
  //     const sanitized: Partial<LocationEntity> = {};
  //     for (const key in SANITIZE_MAP) {
  //       if (Object.prototype.hasOwnProperty.call(data, key)) {
  //         sanitized[key] = SANITIZE_MAP[key](data[key]);
  //       }
  //     }
  //     return sanitized;
  //   }

  async findAll(): Promise<LocationEntity[]> {
    const docs = await this.locationModel.find().exec();
    return docs.map((doc) => this.map(doc.toObject()));
  }

  async findByCountry(country: string): Promise<LocationEntity | undefined> {
    const doc = await this.locationModel.findOne({ country }).exec();
    return doc ? this.map(doc.toObject()) : undefined;
  }

  async findManyWithPagination({
    filterOptions,
    sortOptions,
    paginationOptions,
  }: {
    filterOptions?: FilterLocationDto | null;
    sortOptions?: SortLocationDto[] | null;
    paginationOptions: IPaginationOptions;
  }): Promise<PaginationResult<LocationEntity>> {
    // Build filter query using FilterQueryBuilder
    const filterQuery = new FilterQueryBuilder<LocationSchemaClass>()
      .addEqual('country' as any, filterOptions?.country)
      .addEqual('countryCode' as any, filterOptions?.countryCode)
      .addEqual('currency' as any, filterOptions?.currency)
      .build();

    // Add search filter
    const additionalFilters: any = {};

    if (filterOptions?.search) {
      // Use regex search for better compatibility
      const searchRegex = new RegExp(filterOptions.search, 'i');
      additionalFilters.$or = [
        { country: searchRegex },
        { countryCode: searchRegex },
      ];
    }

    const combinedFilter = { ...filterQuery, ...additionalFilters };

    // Use buildMongooseQuery utility
    return buildMongooseQuery({
      model: this.locationModel as any,
      filterQuery: combinedFilter,
      sortOptions,
      paginationOptions,
      populateFields: [],
      mapper: (doc) => this.map(doc),
    });
  }

  //   private map(doc: any): LocationEntity {
  //     if (!doc) return undefined as any;

  //     // Sanitize the document to convert all IDs and nested objects
  //     const sanitized = this.sanitizeData(doc);

  //     // Double-check sanitized is not null
  //     if (!sanitized) return undefined as any;

  //     const entity = new LocationEntity();
  //     entity.country = sanitized.country;
  //     entity.countryCode = sanitized.countryCode;
  //     entity.currency = sanitized.currency;
  //     entity.createdAt = sanitized.createdAt;
  //     entity.updatedAt = sanitized.updatedAt;
  //     return entity;
  //   }
}
