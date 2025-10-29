import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model } from 'mongoose';

import { NullableType } from '../../../../../utils/types/nullable.type';
import { IPaginationOptions } from '../../../../../utils/types/pagination-options';

import { EnrollmentEntity } from '../../../../domain/enrollment';
import {
  FilterEnrollmentDto,
  SortEnrollmentDto,
} from '../../../../dto/query-enrollment.dto';
import { EnrollmentRepository } from '../../enrollments.repository';
import { EnrollmentSchemaClass } from '../entities/enrollments.schema';
import { EnrollmentMapper } from '../mapper/enrollments.mapper';

@Injectable()
export class EnrollmentsDocumentRepository implements EnrollmentRepository {
  constructor(
    @InjectModel(EnrollmentSchemaClass.name)
    private readonly enrollmentsModel: Model<EnrollmentSchemaClass>,
  ) {}

  async create(data: EnrollmentEntity): Promise<EnrollmentEntity> {
    const persistenceModel = EnrollmentMapper.toPersistence(data);
    const createdEnrollment = new this.enrollmentsModel(persistenceModel);
    const enrollmentObject = await createdEnrollment.save();
    return EnrollmentMapper.toDomain(enrollmentObject);
  }

  async findManyWithPagination({
    filterOptions,
    sortOptions,
    paginationOptions,
  }: {
    filterOptions?: FilterEnrollmentDto | null;
    sortOptions?: SortEnrollmentDto[] | null;
    paginationOptions: IPaginationOptions;
  }): Promise<EnrollmentEntity[]> {
    const where: FilterQuery<EnrollmentSchemaClass> = {};

    // 🔍 Filtering
    if (filterOptions?.userId) {
      where['user'] = filterOptions.userId;
    }

    if (filterOptions?.courseId) {
      where['course'] = filterOptions.courseId;
    }

    if (filterOptions?.status) {
      where['status'] = filterOptions.status;
    }

    if (filterOptions?.minProgress !== undefined) {
      where['progress'] = { $gte: filterOptions.minProgress };
    }

    if (filterOptions?.maxProgress !== undefined) {
      where['progress'] = {
        ...where['progress'],
        $lte: filterOptions.maxProgress,
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

    const enrollmentObjects = await this.enrollmentsModel
      .find(where)
      .sort(sort)
      .skip((paginationOptions.page - 1) * paginationOptions.limit)
      .limit(paginationOptions.limit)
      .populate('user')
      .populate('course');

    return enrollmentObjects.map((obj) => EnrollmentMapper.toDomain(obj));
  }

  async findById(
    id: EnrollmentEntity['id'],
  ): Promise<NullableType<EnrollmentEntity>> {
    const enrollmentObject = await this.enrollmentsModel
      .findById(id)
      .populate('user')
      .populate('course');
    return enrollmentObject
      ? EnrollmentMapper.toDomain(enrollmentObject)
      : null;
  }

  async findByIds(ids: EnrollmentEntity['id'][]): Promise<EnrollmentEntity[]> {
    const enrollmentObjects = await this.enrollmentsModel
      .find({ _id: { $in: ids } })
      .populate('user')
      .populate('course');
    return enrollmentObjects.map((obj) => EnrollmentMapper.toDomain(obj));
  }

  async findByUserAndCourse(
    userId: string,
    courseId: string,
  ): Promise<NullableType<EnrollmentEntity>> {
    const enrollmentObject = await this.enrollmentsModel
      .findOne({ user: userId, course: courseId })
      .populate('user')
      .populate('course');
    return enrollmentObject
      ? EnrollmentMapper.toDomain(enrollmentObject)
      : null;
  }

  async update(
    id: EnrollmentEntity['id'],
    payload: Partial<EnrollmentEntity>,
  ): Promise<EnrollmentEntity | null> {
    const clonedPayload = { ...payload };
    delete clonedPayload.id;

    const filter = { _id: id.toString() };
    const existing = await this.enrollmentsModel.findOne(filter);
    if (!existing) return null;

    const updatedObject = await this.enrollmentsModel
      .findOneAndUpdate(
        filter,
        EnrollmentMapper.toPersistence({
          ...EnrollmentMapper.toDomain(existing),
          ...clonedPayload,
        }),
        { new: true },
      )
      .populate('user')
      .populate('course');

    return updatedObject ? EnrollmentMapper.toDomain(updatedObject) : null;
  }

  async remove(id: EnrollmentEntity['id']): Promise<void> {
    await this.enrollmentsModel.deleteOne({ _id: id.toString() });
  }
}
