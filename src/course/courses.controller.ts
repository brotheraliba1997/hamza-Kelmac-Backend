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
  ApiOperation,
  ApiBody,
  ApiResponse,
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
  @ApiOperation({
    summary: 'Create a new course',
    description:
      'Creates a new course with all details including sessions, FAQs, pricing, timetables, and snapshots. Requires instructor or admin role (currently disabled).',
  })
  @ApiBody({ type: CreateCourseDto })
  @ApiCreatedResponse({
    description: 'Course created successfully',
    type: CourseEntity,
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - validation failed or category not found',
  })
  @ApiCreatedResponse()
  @HttpCode(HttpStatus.CREATED)
  @Post()
  create(@Body() dto: CreateCourseDto) {
    // return {
    //   message: 'Course created successfully',
    //   data: dto?.sessions,
    // };
    return this.service.create(dto);
  }

  @ApiOperation({
    summary: 'Get all courses with filters',
    description:
      'Retrieve a paginated list of courses with optional filters for category, price, rating, skill level, language, and more.',
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
  @ApiQuery({
    name: 'category',
    required: false,
    type: String,
    description: 'Filter by category ID',
  })
  @ApiQuery({
    name: 'subcategory',
    required: false,
    type: String,
    description: 'Filter by subcategory name',
  })
  @ApiQuery({
    name: 'topic',
    required: false,
    type: String,
    description: 'Filter by topic',
  })
  @ApiQuery({
    name: 'minPrice',
    required: false,
    type: Number,
    description: 'Minimum price filter',
  })
  @ApiQuery({
    name: 'maxPrice',
    required: false,
    type: Number,
    description: 'Maximum price filter',
  })
  @ApiQuery({
    name: 'minRating',
    required: false,
    type: Number,
    description: 'Minimum average rating (0-5)',
  })
  @ApiQuery({
    name: 'skillLevel',
    required: false,
    type: String,
    description: 'Filter by skill level (beginner, intermediate, advanced)',
  })
  @ApiQuery({
    name: 'language',
    required: false,
    type: String,
    description: 'Filter by course language',
  })
  @ApiQuery({
    name: 'isFeatured',
    required: false,
    type: Boolean,
    description: 'Filter featured courses',
  })
  @ApiQuery({
    name: 'isPublished',
    required: false,
    type: Boolean,
    description: 'Filter published/draft courses',
  })
  @ApiQuery({
    name: 'search',
    required: false,
    type: String,
    description: 'Search in title and description',
  })
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

  @ApiOperation({
    summary: 'Get course by ID',
    description: 'Retrieve a single course by its MongoDB ObjectId',
  })
  @ApiOkResponse({
    description: 'Course found',
    type: CourseEntity,
  })
  @ApiResponse({
    status: 404,
    description: 'Course not found',
  })
  @ApiParam({
    name: 'id',
    type: String,
    required: true,
    description: 'Course ObjectId',
    example: '507f1f77bcf86cd799439011',
  })
  @HttpCode(HttpStatus.OK)
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findById(id);
  }

  @ApiOperation({
    summary: 'Get course by slug',
    description:
      'Retrieve a course using its SEO-friendly slug (e.g., introduction-to-web-development)',
  })
  @ApiOkResponse({
    description: 'Course found',
    type: CourseEntity,
  })
  @ApiResponse({
    status: 404,
    description: 'Course not found',
  })
  @ApiParam({
    name: 'slug',
    type: String,
    required: true,
    description: 'Course slug (e.g., introduction-to-web-development)',
    example: 'introduction-to-web-development',
  })
  @HttpCode(HttpStatus.OK)
  @Get('slug/:slug')
  findBySlug(@Param('slug') slug: string) {
    return this.service.findBySlug(slug);
  }

  @ApiOperation({
    summary: 'Get courses by category',
    description:
      'Retrieve paginated courses filtered by category slug. Returns all courses in the specified category.',
  })
  @ApiOkResponse({
    type: InfinityPaginationResponse(CourseEntity),
    description: 'Paginated list of courses in the category',
  })
  @ApiResponse({
    status: 404,
    description: 'Category not found',
  })
  @ApiParam({
    name: 'categorySlug',
    type: String,
    required: true,
    description: 'Category slug (e.g., web-development)',
    example: 'web-development',
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

  @ApiOperation({
    summary: 'Get courses by subcategory',
    description:
      'Retrieve paginated courses filtered by subcategory name. Returns all courses with the specified subcategory.',
  })
  @ApiOkResponse({
    type: InfinityPaginationResponse(CourseEntity),
    description: 'Paginated list of courses in the subcategory',
  })
  @ApiParam({
    name: 'subcategory',
    type: String,
    required: true,
    description: 'Subcategory name',
    example: 'Frontend Development',
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

  @ApiOperation({
    summary: 'Update course',
    description:
      'Update an existing course. Requires authentication and admin/instructor role. Can update all course details including sessions, pricing, and metadata.',
  })
  @ApiBearerAuth()
  @Roles(RoleEnum.admin, RoleEnum.instructor)
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @ApiBody({ type: UpdateCourseDto })
  @ApiOkResponse({
    description: 'Course updated successfully',
    type: CourseEntity,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - authentication required',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - insufficient permissions',
  })
  @ApiResponse({
    status: 404,
    description: 'Course not found',
  })
  @ApiParam({
    name: 'id',
    type: String,
    required: true,
    description: 'Course ObjectId',
    example: '507f1f77bcf86cd799439011',
  })
  @HttpCode(HttpStatus.OK)
  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateCourseDto) {
    return this.service.update(id, dto);
  }

  @ApiOperation({
    summary: 'Delete course',
    description:
      'Permanently delete a course. Requires authentication and admin/instructor role. This action cannot be undone and will decrement the category course count.',
  })
  @ApiBearerAuth()
  @Roles(RoleEnum.admin, RoleEnum.instructor)
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @ApiResponse({
    status: 204,
    description: 'Course deleted successfully',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - authentication required',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - insufficient permissions',
  })
  @ApiResponse({
    status: 404,
    description: 'Course not found',
  })
  @ApiParam({
    name: 'id',
    type: String,
    required: true,
    description: 'Course ObjectId',
    example: '507f1f77bcf86cd799439011',
  })
  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }

  @ApiOperation({
    summary: 'Get courses grouped by featured categories',
    description:
      'Retrieve all published courses organized by featured categories. Returns category details and courses with duration, lessons count, and descriptions. Dynamically includes all featured categories.',
  })
  @ApiOkResponse({
    description:
      'Courses grouped by featured categories with category metadata',
    schema: {
      type: 'object',
      example: {
        isoCourses: {
          categoryName: 'ISO Courses',
          categorySlug: 'iso-courses',
          categoryDescription:
            'International Organization for Standardization certification courses',
          categoryIcon: 'fas fa-certificate',
          categoryColor: '#e74c3c',
          courses: [
            {
              href: '/courses/iso-9001-foundation',
              title: 'ISO 9001 Foundation',
              hours: '19+ Hours',
              lessons: '10 Lessons',
              description: 'Learn the fundamentals of ISO 9001 standards',
            },
          ],
        },
        qualityManagement: {
          categoryName: 'Quality Management',
          categorySlug: 'quality-management',
          categoryDescription: 'Quality management systems and methodologies',
          categoryIcon: 'fas fa-award',
          categoryColor: '#3498db',
          courses: [
            {
              href: '/courses/quality-basics',
              title: 'Quality Basics',
              hours: '10+ Hours',
              lessons: '6 Lessons',
              description: 'Introduction to quality management',
            },
          ],
        },
        healthSafety: {
          categoryName: 'Health & Safety',
          categorySlug: 'health-safety',
          categoryDescription:
            'Workplace health, safety and environmental courses',
          categoryIcon: 'fas fa-shield-alt',
          categoryColor: '#27ae60',
          courses: [
            {
              href: '/courses/hse-foundation',
              title: 'HSE Foundation',
              hours: '14+ Hours',
              lessons: '7 Lessons',
              description: 'Learn Health, Safety & Environment fundamentals',
            },
          ],
        },
      },
    },
  })
  @HttpCode(HttpStatus.OK)
  @Get('grouped/by-category')
  getCoursesByCategories() {
    return this.service.getCoursesByCategories();
  }
}
