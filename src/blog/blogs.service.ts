import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateBlogDto } from './dto/create-blog.dto';
import { UpdateBlogDto } from './dto/update-blog.dto';
import { BlogEntity } from './domain/blog';
import { FilterBlogDto, SortBlogDto } from './dto/query-blog.dto';
import { IPaginationOptions } from '../utils/types/pagination-options';
import { BlogSchemaClass } from './schema/blogs.schema';
import {
  buildMongooseQuery,
  FilterQueryBuilder,
  PaginationResult,
} from '../utils/mongoose-query-builder';

@Injectable()
export class BlogsService {
  constructor(
    @InjectModel(BlogSchemaClass.name)
    private readonly blogModel: Model<BlogSchemaClass>,
  ) {}

  private map(doc: any): BlogEntity {
    if (!doc) return undefined as any;
    const id = typeof doc.id !== 'undefined' ? doc.id : doc._id?.toString?.();
    return new BlogEntity(
      id,
      doc.title,
      doc.content,
      (doc.author as any)?.toString?.() ?? doc.author,
      doc.comments || [],
      doc.isPublished,
      doc.createdAt,
      doc.updatedAt,
      doc.deletedAt ?? null,
    );
  }

  async create(createBlogDto: CreateBlogDto): Promise<BlogEntity> {
    const toCreate = {
      ...createBlogDto,
      isPublished: createBlogDto.isPublished ?? true,
    };
    const created = await this.blogModel.create(toCreate);
    return this.map(created);
  }

  async findAll({
    filterOptions,
    sortOptions,
    paginationOptions,
  }: {
    filterOptions?: FilterBlogDto;
    sortOptions?: SortBlogDto[];
    paginationOptions: IPaginationOptions;
  }): Promise<PaginationResult<BlogEntity>> {
    // Build filter query using FilterQueryBuilder
    const filterQuery = new FilterQueryBuilder<BlogSchemaClass>()
      .addEqual('author' as any, filterOptions?.authorId)
      .addEqual('isPublished' as any, filterOptions?.isPublished)
      .addTextSearch('title' as any, filterOptions?.title)
      .build();

    // Use buildMongooseQuery utility
    return buildMongooseQuery({
      model: this.blogModel,
      filterQuery,
      sortOptions,
      paginationOptions,
      populateFields: [{ path: 'author', select: 'firstName lastName email' }],
      mapper: (doc) => this.map(doc),
    });
  }

  async findOne(id: string): Promise<BlogEntity | null> {
    const doc = await this.blogModel
      .findById(id)
      .populate('author', 'firstName lastName email')
      .lean();
    return doc ? this.map(doc) : null;
  }

  async findByIds(ids: string[]): Promise<BlogEntity[]> {
    const docs = await this.blogModel
      .find({ _id: { $in: ids } })
      .populate('author', 'firstName lastName email')
      .lean();
    return docs.map((doc: any) => this.map(doc));
  }

  async update(
    id: string,
    updateBlogDto: UpdateBlogDto,
  ): Promise<BlogEntity | null> {
    const doc = await this.blogModel
      .findByIdAndUpdate(id, updateBlogDto, { new: true })
      .populate('author', 'firstName lastName email')
      .lean();
    return doc ? this.map(doc) : null;
  }

  async remove(id: string): Promise<void> {
    await this.blogModel.deleteOne({ _id: id });
  }
}
