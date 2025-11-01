import { DeepPartial } from "typeorm";
import { NullableType } from "../../utils/types/nullable.type";
import { IPaginationOptions } from "../../utils/types/pagination-options";
import { ClassScheduleEntity } from "../doman/class-scheduleEntity";
import { FilterClassScheduleDto, SortClassScheduleDto } from "../dto/query-class-schedule.dto";



export abstract class ClassScheduleRepository {
  abstract create(
    data: Omit<
      ClassScheduleEntity,
      'id' | 'createdAt' | 'updatedAt' | 'deletedAt'
    >,
  ): Promise<ClassScheduleEntity>;

  abstract findManyWithPagination({
    filterOptions,
    sortOptions,
    paginationOptions,
  }: {
    filterOptions?: FilterClassScheduleDto | null;
    sortOptions?: SortClassScheduleDto[] | null;
    paginationOptions: IPaginationOptions;
  }): Promise<ClassScheduleEntity[]>;

  abstract findById(
    id: ClassScheduleEntity['id'],
  ): Promise<NullableType<ClassScheduleEntity>>;

  abstract findByIds(
    ids: ClassScheduleEntity['id'][],
  ): Promise<ClassScheduleEntity[]>;

  abstract update(
    id: ClassScheduleEntity['id'],
    payload: DeepPartial<ClassScheduleEntity>,
  ): Promise<ClassScheduleEntity | null>;

  abstract remove(id: ClassScheduleEntity['id']): Promise<void>;
}
