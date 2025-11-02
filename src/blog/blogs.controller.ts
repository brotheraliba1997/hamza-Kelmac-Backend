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
import { infinityPagination } from '../utils/infinity-pagination';
import {
  InfinityPaginationResponse,
  InfinityPaginationResponseDto,
} from '../utils/dto/infinity-pagination-response.dto';

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

  @ApiOkResponse({
    type: InfinityPaginationResponse(BlogEntity),
  })
  @HttpCode(HttpStatus.OK)
  @Get()
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'authorId', required: false, type: String })
  @ApiQuery({ name: 'isPublished', required: false, type: Boolean })
  @ApiQuery({ name: 'title', required: false, type: String })
  async findAll(@Query() query: any) {
    const page = query?.page ?? 1;
    let limit = query?.limit ?? 10;
    if (limit > 50) {
      limit = 50;
    }

    const filterOptions: FilterBlogDto = {};
    if (query?.authorId) filterOptions.authorId = query.authorId;
    if (query?.isPublished !== undefined)
      filterOptions.isPublished =
        query.isPublished === 'true' || query.isPublished === true;
    if (query?.title) filterOptions.title = query.title;

    // Default sort by createdAt descending
    const sortOptions: SortBlogDto[] = query?.sort || [
      { orderBy: 'createdAt', order: 'DESC' },
    ];

    return this.service.findAll({
      filterOptions,
      sortOptions,
      paginationOptions: {
        page: Number(page),
        limit: Number(limit),
      },
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
