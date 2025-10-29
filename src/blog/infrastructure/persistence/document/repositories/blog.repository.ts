import { DeepPartial } from '../../../../../utils/types/deep-partial.type';
import { NullableType } from '../../../../../utils/types/nullable.type';
import { IPaginationOptions } from '../../../../../utils/types/pagination-options';
import { BlogEntity } from '../../../../domain/blog';
import { FilterBlogDto, SortBlogDto } from '../../../../dto/query-blog.dto';

export abstract class BlogRepository {
  abstract create(
    data: Omit<BlogEntity, 'id' | 'createdAt' | 'deletedAt' | 'updatedAt'>,
  ): Promise<BlogEntity>;

  abstract findManyWithPagination({
    filterOptions,
    sortOptions,
    paginationOptions,
  }: {
    filterOptions?: FilterBlogDto | null;
    sortOptions?: SortBlogDto[] | null;
    paginationOptions: IPaginationOptions;
  }): Promise<BlogEntity[]>;

  abstract findById(id: BlogEntity['id']): Promise<NullableType<BlogEntity>>;

  abstract findByIds(ids: BlogEntity['id'][]): Promise<BlogEntity[]>;

  abstract update(
    id: BlogEntity['id'],
    payload: DeepPartial<BlogEntity>,
  ): Promise<BlogEntity | null>;

  abstract remove(id: BlogEntity['id']): Promise<void>;
}
