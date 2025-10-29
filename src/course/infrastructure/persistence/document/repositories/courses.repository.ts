import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model } from 'mongoose';

import { NullableType } from '../../../../../utils/types/nullable.type';
import { IPaginationOptions } from '../../../../../utils/types/pagination-options';

// import { CourseEntity } from '../../../../domain/entities/course.entity';
// import { CourseRepository } from '../../course.repository';
// import { CourseSchemaClass } from '../entities/course.schema';
// import { CourseMapper } from '../mappers/course.mapper';

// import {
//   FilterCourseDto,
//   SortCourseDto,
// } from '../../../../dto/query-course.dto';
import { CourseSchemaClass } from '../entities/course.schema';
import { CourseMapper } from '../mapper/courses.mapper';
import { CourseEntity } from '../../../../domain/course';
import {
  FilterCourseDto,
  SortCourseDto,
} from '../../../../dto/query-course.dto';
import { CourseRepository } from '../../courses.repository';

@Injectable()
export class CoursesDocumentRepository implements CourseRepository {
  constructor(
    @InjectModel(CourseSchemaClass.name)
    private readonly coursesModel: Model<CourseSchemaClass>,
  ) {}

  async create(data: CourseEntity): Promise<CourseEntity> {
    const persistenceModel = CourseMapper.toPersistence(data);
    const createdCourse = new this.coursesModel(persistenceModel);
    const courseObject = await createdCourse.save();
    return CourseMapper.toDomain(courseObject);
  }

  async findManyWithPagination({
    filterOptions,
    sortOptions,
    paginationOptions,
  }: {
    filterOptions?: FilterCourseDto | null;
    sortOptions?: SortCourseDto[] | null;
    paginationOptions: IPaginationOptions;
  }): Promise<CourseEntity[]> {
    const where: FilterQuery<CourseSchemaClass> = {};

    // 🔍 Filtering
    if (filterOptions?.instructorId) {
      where['instructor'] = filterOptions.instructorId;
    }

    if (filterOptions?.isPublished !== undefined) {
      where['isPublished'] = filterOptions.isPublished;
    }

    if (
      filterOptions?.minPrice !== undefined &&
      filterOptions?.maxPrice !== undefined
    ) {
      where['price'] = {
        $gte: filterOptions.minPrice,
        $lte: filterOptions.maxPrice,
      };
    }

    // 🔃 Sorting
    const sort: any = sortOptions?.reduce(
      (accumulator, sort) => ({
        ...accumulator,
        [sort.orderBy === 'id' ? '_id' : sort.orderBy]:
          sort.order.toUpperCase() === 'ASC' ? 1 : -1,
      }),
      {},
    ) ?? { createdAt: -1 };

    const courseObjects = await this.coursesModel
      .find(where)
      .sort(sort)
      .skip((paginationOptions.page - 1) * paginationOptions.limit)
      .limit(paginationOptions.limit)
      .populate('instructor'); // 👈 populate instructor reference

    return courseObjects.map((obj) => CourseMapper.toDomain(obj));
  }

  async findById(id: CourseEntity['id']): Promise<NullableType<CourseEntity>> {
    const courseObject = await this.coursesModel
      .findById(id)
      .populate('instructor');
    return courseObject ? CourseMapper.toDomain(courseObject) : null;
  }

  async findByIds(ids: CourseEntity['id'][]): Promise<CourseEntity[]> {
    const courseObjects = await this.coursesModel
      .find({ _id: { $in: ids } })
      .populate('instructor');
    return courseObjects.map((obj) => CourseMapper.toDomain(obj));
  }

  async update(
    id: CourseEntity['id'],
    payload: Partial<CourseEntity>,
  ): Promise<CourseEntity | null> {
    const clonedPayload = { ...payload };
    delete clonedPayload.id;

    const filter = { _id: id.toString() };
    const existing = await this.coursesModel.findOne(filter);
    if (!existing) return null;

    const updatedObject = await this.coursesModel.findOneAndUpdate(
      filter,
      CourseMapper.toPersistence({
        ...CourseMapper.toDomain(existing),
        ...clonedPayload,
      }),
      { new: true },
    );

    return updatedObject ? CourseMapper.toDomain(updatedObject) : null;
  }

  async remove(id: CourseEntity['id']): Promise<void> {
    await this.coursesModel.deleteOne({ _id: id.toString() });
  }
}
