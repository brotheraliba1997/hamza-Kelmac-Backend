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
  SerializeOptions,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiParam,
  ApiTags,
  ApiQuery,
} from '@nestjs/swagger';
import { CoursesService } from './courses.service';
import { CreateCourseDto } from './dto/create-course.dto';
import { UpdateCourseDto } from './dto/update-course.dto';
import { FilterCourseDto, QueryCourseDto } from './dto/query-course.dto';
import { infinityPagination } from '../utils/infinity-pagination';
import {
  InfinityPaginationResponse,
  InfinityPaginationResponseDto,
} from '../utils/dto/infinity-pagination-response.dto';
import { CourseEntity } from './domain/course';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../roles/roles.guard';
import { Roles } from '../roles/roles.decorator';
import { RoleEnum } from '../roles/roles.enum';

@ApiTags('Courses')
@Controller({
  path: 'courses',
  version: '1',
})
export class CoursesController {
  constructor(private readonly service: CoursesService) {}

  // @ApiBearerAuth()
  // @Roles(RoleEnum.instructor, RoleEnum.admin)
  // @UseGuards(AuthGuard('jwt'), RolesGuard)
  @ApiCreatedResponse()
  @HttpCode(HttpStatus.CREATED)
  @Post()
  create(@Body() dto: CreateCourseDto) {
    return this.service.create(dto);
  }

  @ApiOkResponse({
    type: InfinityPaginationResponse(CourseEntity),
  })
  @SerializeOptions({
    groups: ['admin'],
  })
  @Get()
  @HttpCode(HttpStatus.OK)
  async findAll(@Query() queryDto: FilterCourseDto & QueryCourseDto) {
    const page = queryDto?.page ?? 1;
    let limit = queryDto?.limit ?? 10;
    if (limit > 50) {
      limit = 50;
    }

    return this.service.findManyWithPagination({
      filterOptions: queryDto,
      sortOptions: null,
      paginationOptions: {
        page: Number(page),
        limit: Number(limit),
      },
    });
  }

  @ApiOkResponse()
  @ApiParam({
    name: 'id',
    type: String,
    required: true,
  })
  @HttpCode(HttpStatus.OK)
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findById(id);
  }

  @ApiOkResponse({
    description: 'Get course by slug',
  })
  @ApiParam({
    name: 'slug',
    type: String,
    required: true,
    description: 'Course slug (e.g., introduction-to-web-development)',
  })
  @HttpCode(HttpStatus.OK)
  @Get('slug/:slug')
  findBySlug(@Param('slug') slug: string) {
    return this.service.findBySlug(slug);
  }

  @ApiOkResponse({
    type: InfinityPaginationResponse(CourseEntity),
    description: 'Get courses by category',
  })
  @ApiParam({
    name: 'categorySlug',
    type: String,
    required: true,
    description: 'Category slug (e.g., web-development)',
  })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    description: 'Page number (default: 1)',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Items per page (default: 10, max: 50)',
  })
  @HttpCode(HttpStatus.OK)
  @Get('category/:categorySlug')
  async findByCategory(
    @Param('categorySlug') categorySlug: string,
    @Query() query: any,
  ) {
    const page = query?.page ?? 1;
    let limit = query?.limit ?? 10;
    if (limit > 50) {
      limit = 50;
    }

    return this.service.findByCategory(categorySlug, {
      page: Number(page),
      limit: Number(limit),
    });
  }

  @ApiOkResponse({
    type: InfinityPaginationResponse(CourseEntity),
    description: 'Get courses by subcategory',
  })
  @ApiParam({
    name: 'subcategory',
    type: String,
    required: true,
    description: 'Subcategory name',
  })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    description: 'Page number (default: 1)',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Items per page (default: 10, max: 50)',
  })
  @HttpCode(HttpStatus.OK)
  @Get('subcategory/:subcategory')
  async findBySubcategory(
    @Param('subcategory') subcategory: string,
    @Query() query: any,
  ) {
    const page = query?.page ?? 1;
    let limit = query?.limit ?? 10;
    if (limit > 50) {
      limit = 50;
    }

    return this.service.findBySubcategory(subcategory, {
      page: Number(page),
      limit: Number(limit),
    });
  }

  @ApiBearerAuth()
  @Roles(RoleEnum.admin, RoleEnum.instructor)
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @ApiOkResponse()
  @ApiParam({
    name: 'id',
    type: String,
    required: true,
  })
  @HttpCode(HttpStatus.OK)
  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateCourseDto) {
    return this.service.update(id, dto);
  }

  @ApiBearerAuth()
  @Roles(RoleEnum.admin, RoleEnum.instructor)
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @ApiParam({
    name: 'id',
    type: String,
    required: true,
  })
  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
