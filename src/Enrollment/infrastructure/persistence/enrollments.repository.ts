import { DeepPartial } from '../../../utils/types/deep-partial.type';
import { NullableType } from '../../../utils/types/nullable.type';
import { IPaginationOptions } from '../../../utils/types/pagination-options';
import { EnrollmentEntity } from '../../domain/enrollment';
import {
  FilterEnrollmentDto,
  SortEnrollmentDto,
} from '../../dto/query-enrollment.dto';

export abstract class EnrollmentRepository {
  abstract create(
    data: Omit<
      EnrollmentEntity,
      'id' | 'createdAt' | 'deletedAt' | 'updatedAt'
    >,
  ): Promise<EnrollmentEntity>;

  abstract findManyWithPagination({
    filterOptions,
    sortOptions,
    paginationOptions,
  }: {
    filterOptions?: FilterEnrollmentDto | null;
    sortOptions?: SortEnrollmentDto[] | null;
    paginationOptions: IPaginationOptions;
  }): Promise<EnrollmentEntity[]>;

  abstract findById(
    id: EnrollmentEntity['id'],
  ): Promise<NullableType<EnrollmentEntity>>;

  abstract findByIds(
    ids: EnrollmentEntity['id'][],
  ): Promise<EnrollmentEntity[]>;

  abstract findByUserAndCourse(
    userId: string,
    courseId: string,
  ): Promise<NullableType<EnrollmentEntity>>;

  abstract update(
    id: EnrollmentEntity['id'],
    payload: DeepPartial<EnrollmentEntity>,
  ): Promise<EnrollmentEntity | null>;

  abstract remove(id: EnrollmentEntity['id']): Promise<void>;
}
