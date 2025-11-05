import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Put,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { randomUUID } from 'crypto';

import { CreateClassScheduleDto } from './dto/create-class-schedule.dto';
import { UpdateClassScheduleDto } from './dto/update-class-schedule.dto';
import {
  FilterClassScheduleDto,
  SortClassScheduleDto,
} from './dto/query-class-schedule.dto';
import { ClassScheduleService } from './class-schedule.service';
import { infinityPagination } from '../utils/infinity-pagination';
import { InfinityPaginationResponseDto } from '../utils/dto/infinity-pagination-response.dto';

@ApiTags('Class Schedule')
@Controller('v1/class-schedule')
export class ClassScheduleController {
  constructor(private readonly classScheduleService: ClassScheduleService) {}

  // 📘 Create new class schedule
  @Post()
  @ApiOperation({ summary: 'Create a new class schedule' })
  @ApiResponse({
    status: 201,
    description: 'Class schedule created successfully.',
  })
  create(@Body() dto: CreateClassScheduleDto) {
    dto.securityKey = randomUUID();
     const accessToken = process.env.ACCESS_TOKEN;
    const refreshToken = process.env.REFRESH_TOKEN;
    return this.classScheduleService.create(dto , accessToken, refreshToken);
  }

  // 📗 Get all classes (with filters + sorting)
  @Get()
  @ApiOperation({ summary: 'Get all class schedules with filters and sorting' })
  findAll(
    @Query() filters: FilterClassScheduleDto,
    @Query() sort?: SortClassScheduleDto,
  ) {
    return this.classScheduleService.findAll(filters, sort);
  }

  // 📗 Get paginated class schedules
  @Get('paginated/list')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Get paginated class schedules with filters and sorting',
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
    name: 'instructorId',
    required: false,
    type: String,
    description: 'Filter by instructor ID',
  })
  @ApiQuery({
    name: 'courseId',
    required: false,
    type: String,
    description: 'Filter by course ID',
  })
  @ApiQuery({
    name: 'studentId',
    required: false,
    type: String,
    description: 'Filter by student ID',
  })
  @ApiQuery({
    name: 'status',
    required: false,
    type: String,
    description: 'Filter by status (scheduled, ongoing, completed, cancelled)',
  })
  @ApiQuery({
    name: 'startDate',
    required: false,
    type: String,
    description: 'Filter by start date (YYYY-MM-DD)',
  })
  @ApiQuery({
    name: 'endDate',
    required: false,
    type: String,
    description: 'Filter by end date (YYYY-MM-DD)',
  })
  @ApiQuery({
    name: 'search',
    required: false,
    type: String,
    description: 'Search in Google Meet link or security key',
  })
  async findPaginated(@Query() query: any) {
    const page = query?.page ?? 1;
    let limit = query?.limit ?? 10;
    if (limit > 50) {
      limit = 50;
    }

    const filterOptions: FilterClassScheduleDto = {
      instructorId: query?.instructorId,
      courseId: query?.courseId,
      studentId: query?.studentId,
      status: query?.status,
      startDate: query?.startDate,
      endDate: query?.endDate,
      search: query?.search,
    };

    return this.classScheduleService.findManyWithPagination({
      filterOptions,
      sortOptions: query?.sort,
      paginationOptions: {
        page: Number(page),
        limit: Number(limit),
      },
    });
  }

  // 📘 Get one class schedule by ID
  @Get(':id')
  @ApiOperation({ summary: 'Get a specific class schedule by ID' })
  @ApiResponse({
    status: 200,
    description: 'Class schedule retrieved successfully.',
  })
  findOne(@Param('id') id: string) {
    return this.classScheduleService.findOne(id);
  }

  // 🟡 Update class schedule details (date/time/status/instructor)
  @Put(':id')
  @ApiOperation({ summary: 'Update an existing class schedule' })
  update(@Param('id') id: string, @Body() dto: UpdateClassScheduleDto) {
    return this.classScheduleService.update(id, dto);
  }

  // 🔴 Delete a class schedule
  @Delete(':id')
  @ApiOperation({ summary: 'Delete a class schedule by ID' })
  remove(@Param('id') id: string) {
    return this.classScheduleService.remove(id);
  }

  // 🟢 Join class using security key (for students)
  @Get('/join/:securityKey')
  @ApiOperation({ summary: 'Join class via security key' })
  joinClass(@Param('securityKey') key: string) {
    return this.classScheduleService.joinClass(key);
  }
}
