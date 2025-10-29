import { Injectable } from '@nestjs/common';
import { CreateBlogDto } from './dto/create-blog.dto';
import { UpdateBlogDto } from './dto/update-blog.dto';
import { BlogEntity } from './domain/blog';

import { FilterBlogDto, SortBlogDto } from './dto/query-blog.dto';
import { BlogRepository } from './infrastructure/persistence/document/repositories/blog.repository';
import { IPaginationOptions } from '../utils/types/pagination-options';

@Injectable()
export class BlogsService {
  constructor(private readonly blogRepository: BlogRepository) {}

  async create(createBlogDto: CreateBlogDto): Promise<BlogEntity> {
    const blogEntity = new BlogEntity(
      null, // id will be generated
      createBlogDto.title,
      createBlogDto.content,
      createBlogDto.author, // This should be the user ID string
      [], // empty comments array
      createBlogDto.isPublished ?? true,
      new Date(), // createdAt
      new Date(), // updatedAt
      null, // deletedAt
    );

    return this.blogRepository.create(blogEntity);
  }

  async findAll({
    filterOptions,
    sortOptions,
    paginationOptions,
  }: {
    filterOptions?: FilterBlogDto;
    sortOptions?: SortBlogDto[];
    paginationOptions: IPaginationOptions;
  }): Promise<BlogEntity[]> {
    return this.blogRepository.findManyWithPagination({
      filterOptions,
      sortOptions,
      paginationOptions,
    });
  }

  async findOne(id: string): Promise<BlogEntity | null> {
    return this.blogRepository.findById(id);
  }

  async findByIds(ids: string[]): Promise<BlogEntity[]> {
    return this.blogRepository.findByIds(ids);
  }

  async update(
    id: string,
    updateBlogDto: UpdateBlogDto,
  ): Promise<BlogEntity | null> {
    return this.blogRepository.update(id, updateBlogDto);
  }

  async remove(id: string): Promise<void> {
    return this.blogRepository.remove(id);
  }
}
