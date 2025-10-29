import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  HttpCode,
  HttpStatus,
  Query,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiParam,
  ApiTags,
  ApiQuery,
} from '@nestjs/swagger';
import { BlogsService } from './blogs.service';
import { CreateBlogDto } from './dto/create-blog.dto';
import { UpdateBlogDto } from './dto/update-blog.dto';
import { BlogEntity } from './domain/blog';
import { FilterBlogDto, SortBlogDto } from './dto/query-blog.dto';
import { IPaginationOptions } from '../utils/types/pagination-options';

@ApiBearerAuth()
@ApiTags('Blogs')
@Controller({
  path: 'blogs',
  version: '1',
})
export class BlogsController {
  constructor(private readonly service: BlogsService) {}

  @ApiCreatedResponse({ type: BlogEntity })
  @HttpCode(HttpStatus.CREATED)
  @Post()
  async create(@Body() createBlogDto: CreateBlogDto): Promise<BlogEntity> {
    return this.service.create(createBlogDto);
  }

  @ApiOkResponse({ type: [BlogEntity] })
  @HttpCode(HttpStatus.OK)
  @Get()
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'authorId', required: false, type: String })
  @ApiQuery({ name: 'isPublished', required: false, type: Boolean })
  @ApiQuery({ name: 'title', required: false, type: String })
  async findAll(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
    @Query('authorId') authorId?: string,
    @Query('isPublished') isPublished?: boolean,
    @Query('title') title?: string,
  ): Promise<BlogEntity[]> {
    const filterOptions: FilterBlogDto = {};
    const paginationOptions: IPaginationOptions = {
      page: Number(page),
      limit: Number(limit),
    };

    if (authorId) filterOptions.authorId = authorId;
    if (isPublished !== undefined)
      filterOptions.isPublished = isPublished === true;
    if (title) filterOptions.title = title;

    // Default sort by createdAt descending
    const sortOptions: SortBlogDto[] = [
      { orderBy: 'createdAt', order: 'DESC' },
    ];

    return this.service.findAll({
      filterOptions,
      sortOptions,
      paginationOptions,
    });
  }

  @ApiOkResponse({ type: BlogEntity })
  @ApiParam({
    name: 'id',
    type: String,
    required: true,
  })
  @HttpCode(HttpStatus.OK)
  @Get(':id')
  async findOne(@Param('id') id: string): Promise<BlogEntity | null> {
    return this.service.findOne(id);
  }

  @ApiOkResponse({ type: BlogEntity })
  @ApiParam({
    name: 'id',
    type: String,
    required: true,
  })
  @HttpCode(HttpStatus.OK)
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateBlogDto: UpdateBlogDto,
  ): Promise<BlogEntity | null> {
    return this.service.update(id, updateBlogDto);
  }

  @ApiParam({
    name: 'id',
    type: String,
    required: true,
  })
  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete(':id')
  async remove(@Param('id') id: string): Promise<void> {
    return this.service.remove(id);
  }
}
