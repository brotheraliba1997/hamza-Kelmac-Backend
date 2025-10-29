import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model } from 'mongoose';
import { BlogRepository } from './persistence/document/repositories/blog.repository';
import { BlogSchemaClass } from './persistence/document/entities/blogs.schema';
import { BlogEntity } from '../domain/blog';
import { BlogMapper } from './persistence/document/mapper/blogs.mapper';
import { FilterBlogDto, SortBlogDto } from '../dto/query-blog.dto';
import { IPaginationOptions } from '../../utils/types/pagination-options';
import { NullableType } from '../../utils/types/nullable.type';

// import { NullableType } from '../../../../../utils/types/nullable.type';
// import { IPaginationOptions } from '../../../../../utils/types/pagination-options';

// import { BlogSchemaClass } from '../entities/blog.schema';
// import { BlogMapper } from '../mappers/blog.mapper';
// import { BlogEntity } from '../../../../domain/blog';
// import { FilterBlogDto, SortBlogDto } from '../../../../dto/query-blog.dto';
// import { BlogRepository } from '../../blog.repository';

@Injectable()
export class BlogsDocumentRepository implements BlogRepository {
  constructor(
    @InjectModel(BlogSchemaClass.name)
    private readonly blogsModel: Model<BlogSchemaClass>,
  ) {}

  async create(data: BlogEntity): Promise<BlogEntity> {
    const persistenceModel = BlogMapper.toPersistence(data);
    const createdBlog = new this.blogsModel(persistenceModel);
    const blogObject = await createdBlog.save();
    return BlogMapper.toDomain(blogObject);
  }

  async findManyWithPagination({
    filterOptions,
    sortOptions,
    paginationOptions,
  }: {
    filterOptions?: FilterBlogDto | null;
    sortOptions?: SortBlogDto[] | null;
    paginationOptions: IPaginationOptions;
  }): Promise<BlogEntity[]> {
    const where: FilterQuery<BlogSchemaClass> = {};

    // 🔍 Filtering
    if (filterOptions?.authorId) {
      where['author'] = filterOptions.authorId;
    }

    if (filterOptions?.isPublished !== undefined) {
      where['isPublished'] = filterOptions.isPublished;
    }

    if (filterOptions?.title) {
      where['title'] = { $regex: filterOptions.title, $options: 'i' };
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

    const blogObjects = await this.blogsModel
      .find(where)
      .sort(sort)
      .skip((paginationOptions.page - 1) * paginationOptions.limit)
      .limit(paginationOptions.limit)
      .populate('author'); // 👈 populate author reference

    return blogObjects.map((obj) => BlogMapper.toDomain(obj));
  }

  async findById(id: BlogEntity['id']): Promise<NullableType<BlogEntity>> {
    const blogObject = await this.blogsModel.findById(id).populate('author');
    return blogObject ? BlogMapper.toDomain(blogObject) : null;
  }

  async findByIds(ids: BlogEntity['id'][]): Promise<BlogEntity[]> {
    const blogObjects = await this.blogsModel
      .find({ _id: { $in: ids } })
      .populate('author');
    return blogObjects.map((obj) => BlogMapper.toDomain(obj));
  }

  async update(
    id: BlogEntity['id'],
    payload: Partial<BlogEntity>,
  ): Promise<BlogEntity | null> {
    const clonedPayload = { ...payload };
    delete clonedPayload.id;

    const filter = { _id: id.toString() };
    const existing = await this.blogsModel.findOne(filter);
    if (!existing) return null;

    const updatedObject = await this.blogsModel.findOneAndUpdate(
      filter,
      BlogMapper.toPersistence({
        ...BlogMapper.toDomain(existing),
        ...clonedPayload,
      }),
      { new: true },
    );

    return updatedObject ? BlogMapper.toDomain(updatedObject) : null;
  }

  async remove(id: BlogEntity['id']): Promise<void> {
    await this.blogsModel.deleteOne({ _id: id.toString() });
  }
}
