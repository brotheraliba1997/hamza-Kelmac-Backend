import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model } from 'mongoose';
import { NullableType } from '../../../../../utils/types/nullable.type';
import { IPaginationOptions } from '../../../../../utils/types/pagination-options';

import { ClassScheduleSchemaClass } from '../entities/class-schedule.schema';
// import { ClassScheduleMapper } from '../mappers/class-schedule.mapper';
// import { ClassScheduleEntity } from '../../../../domain/class-schedule';
import {
  FilterClassScheduleDto,
  SortClassScheduleDto,
} from '../../../../dto/query-class-schedule.dto';

import { ClassScheduleMapper } from '../mapper/class-schedule.mapper';
import { ClassScheduleEntity } from '../../../../doman/class-scheduleEntity';
import { ClassScheduleRepository } from '../../../class-schedule.repository';

@Injectable()
export class ClassScheduleDocumentRepository
  implements ClassScheduleRepository
{
  constructor(
    @InjectModel(ClassScheduleSchemaClass.name)
    private readonly classScheduleModel: Model<ClassScheduleSchemaClass>,
  ) {}

  // ✅ Create new class schedule
  async create(data: ClassScheduleEntity): Promise<ClassScheduleEntity> {
    const persistenceModel = ClassScheduleMapper.toPersistence(data);
    const createdClass = new this.classScheduleModel(persistenceModel);
    const classObject = await createdClass.save();
    return ClassScheduleMapper.toDomain(classObject);
  }

  // ✅ Fetch with pagination, filters, sorting
  async findManyWithPagination({
    filterOptions,
    sortOptions,
    paginationOptions,
  }: {
    filterOptions?: FilterClassScheduleDto | null;
    sortOptions?: SortClassScheduleDto[] | null;
    paginationOptions: IPaginationOptions;
  }): Promise<ClassScheduleEntity[]> {
    const where: FilterQuery<ClassScheduleSchemaClass> = {};

    // 🎯 Filtering
    if (filterOptions?.courseId) {
      where['course'] = filterOptions.courseId;
    }

    if (filterOptions?.instructorId) {
      where['instructor'] = filterOptions.instructorId;
    }

    if (filterOptions?.status) {
      where['status'] = filterOptions.status;
    }

    if (filterOptions?.startDate || filterOptions?.endDate) {
      where['date'] = {};

      if (filterOptions.startDate) {
        where['date']['$gte'] = filterOptions.startDate;
      }

      if (filterOptions.endDate) {
        where['date']['$lte'] = filterOptions.endDate;
      }
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

    const classObjects = await this.classScheduleModel
      .find(where)
      .sort(sort)
      .skip((paginationOptions.page - 1) * paginationOptions.limit)
      .limit(paginationOptions.limit)
      .populate('course')
      .populate('instructor')
      .populate('students');

    return classObjects.map((obj) => ClassScheduleMapper.toDomain(obj));
  }

  // ✅ Find by ID
  async findById(
    id: ClassScheduleEntity['id'],
  ): Promise<NullableType<ClassScheduleEntity>> {
    const classObject = await this.classScheduleModel
      .findById(id)
      .populate('course instructor students');
    return classObject ? ClassScheduleMapper.toDomain(classObject) : null;
  }

  // ✅ Find multiple by IDs
  async findByIds(
    ids: ClassScheduleEntity['id'][],
  ): Promise<ClassScheduleEntity[]> {
    const classObjects = await this.classScheduleModel
      .find({ _id: { $in: ids } })
      .populate('course instructor students');
    return classObjects.map((obj) => ClassScheduleMapper.toDomain(obj));
  }

  // ✅ Update class schedule
  async update(
    id: ClassScheduleEntity['id'],
    payload: Partial<ClassScheduleEntity>,
  ): Promise<ClassScheduleEntity | null> {
    const clonedPayload = { ...payload };
    delete clonedPayload.id;

    const filter = { _id: id.toString() };
    const existing = await this.classScheduleModel.findOne(filter);
    if (!existing) return null;

    const updatedObject = await this.classScheduleModel.findOneAndUpdate(
      filter,
      ClassScheduleMapper.toPersistence({
        ...ClassScheduleMapper.toDomain(existing),
        ...clonedPayload,
      }),
      { new: true },
    );

    return updatedObject ? ClassScheduleMapper.toDomain(updatedObject) : null;
  }

  // ✅ Delete class schedule
  async remove(id: ClassScheduleEntity['id']): Promise<void> {
    await this.classScheduleModel.deleteOne({ _id: id.toString() });
  }
}
