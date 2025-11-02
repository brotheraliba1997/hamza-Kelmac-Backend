import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateCourseDto } from './dto/create-course.dto';
import { UpdateCourseDto } from './dto/update-course.dto';
import { CourseSchemaClass } from './schema/course.schema';
import { FilterCourseDto, SortCourseDto } from './dto/query-course.dto';
import { IPaginationOptions } from '../utils/types/pagination-options';
import { CourseEntity } from './domain/course';
import { NullableType } from '../utils/types/nullable.type';
import {
  buildMongooseQuery,
  FilterQueryBuilder,
  PaginationResult,
} from '../utils/mongoose-query-builder';

@Injectable()
export class CoursesService {
  constructor(
    @InjectModel(CourseSchemaClass.name)
    private readonly courseModel: Model<CourseSchemaClass>,
  ) {}

  private map(doc: any): CourseEntity {
    if (!doc) return undefined as any;
    const id = typeof doc.id !== 'undefined' ? doc.id : doc._id?.toString?.();
    return new CourseEntity({
      id,
      title: doc.title,
      description: doc.description,
      instructor: (doc.instructor as any)?.toString?.() ?? doc.instructor,
      modules: doc.modules || [],
      price: doc.price,
      enrolledCount: doc.enrolledCount,
      isPublished: doc.isPublished,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
      deletedAt: doc.deletedAt ?? null,
    });
  }

  async create(dto: CreateCourseDto): Promise<CourseEntity> {
    const created = await this.courseModel.create(dto);
    return this.map(created);
  }

  async findManyWithPagination({
    filterOptions,
    sortOptions,
    paginationOptions,
  }: {
    filterOptions?: FilterCourseDto | null;
    sortOptions?: SortCourseDto[] | null;
    paginationOptions: IPaginationOptions;
  }): Promise<PaginationResult<CourseEntity>> {
    // Build filter query using FilterQueryBuilder
    const filterQuery = new FilterQueryBuilder<CourseSchemaClass>()
      .addEqual('instructor' as any, filterOptions?.instructorId)
      .addEqual('isPublished' as any, filterOptions?.isPublished)
      .addRange(
        'price' as any,
        filterOptions?.minPrice,
        filterOptions?.maxPrice,
      )
      .build();

    // Use buildMongooseQuery utility
    return buildMongooseQuery({
      model: this.courseModel,
      filterQuery,
      sortOptions,
      paginationOptions,
      populateFields: [{ path: 'instructor', select: 'name email' }],
      mapper: (doc) => this.map(doc),
    });
  }

  async findById(id: CourseEntity['id']): Promise<NullableType<CourseEntity>> {
    const doc = await this.courseModel
      .findById(id)
      .populate('instructor', 'name email')
      .lean();
    return doc ? this.map(doc) : null;
  }

  async update(id: string, dto: UpdateCourseDto): Promise<CourseEntity | null> {
    const doc = await this.courseModel
      .findByIdAndUpdate(id, dto, { new: true })
      .populate('instructor', 'name email')
      .lean();
    return doc ? this.map(doc) : null;
  }

  async remove(id: string): Promise<void> {
    await this.courseModel.deleteOne({ _id: id });
  }
}
