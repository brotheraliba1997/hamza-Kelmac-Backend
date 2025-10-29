// import { DeepPartial } from '../../../utils/types/deep-partial.type';
// import { NullableType } from '../../../utils/types/nullable.type';
// import { IPaginationOptions } from '../../../utils/types/pagination-options';

import { DeepPartial } from '../../../utils/types/deep-partial.type';
import { NullableType } from '../../../utils/types/nullable.type';
import { IPaginationOptions } from '../../../utils/types/pagination-options';
import { CourseEntity } from '../../domain/course';
import { FilterCourseDto, SortCourseDto } from '../../dto/query-course.dto';

// import { CourseEntity as CourseEntity } from '../../domain/entities/course.entity';
// import { FilterCourseDto, SortCourseDto } from '../../dto/query-course.dto';

export abstract class CourseRepository {
  abstract create(
    data: Omit<CourseEntity, 'id' | 'createdAt' | 'deletedAt' | 'updatedAt'>,
  ): Promise<CourseEntity>;

  abstract findManyWithPagination({
    filterOptions,
    sortOptions,
    paginationOptions,
  }: {
    filterOptions?: FilterCourseDto | null;
    sortOptions?: SortCourseDto[] | null;
    paginationOptions: IPaginationOptions;
  }): Promise<CourseEntity[]>;

  abstract findById(
    id: CourseEntity['id'],
  ): Promise<NullableType<CourseEntity>>;

  abstract findByIds(ids: CourseEntity['id'][]): Promise<CourseEntity[]>;

  abstract update(
    id: CourseEntity['id'],
    payload: DeepPartial<CourseEntity>,
  ): Promise<CourseEntity | null>;

  abstract remove(id: CourseEntity['id']): Promise<void>;
}
