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
import { EnrollmentsService } from './enrollments.service';
import { CreateEnrollmentDto } from './dto/create-enrollment.dto';
import { UpdateEnrollmentDto } from './dto/update-enrollment.dto';
import { EnrollmentEntity } from './domain/enrollment';
import {
  FilterEnrollmentDto,
  SortEnrollmentDto,
} from './dto/query-enrollment.dto';
import { IPaginationOptions } from '../utils/types/pagination-options';

@ApiBearerAuth()
@ApiTags('Enrollments')
@Controller({
  path: 'enrollments',
  version: '1',
})
export class EnrollmentsController {
  constructor(private readonly service: EnrollmentsService) {}

  @ApiCreatedResponse({ type: EnrollmentEntity })
  @HttpCode(HttpStatus.CREATED)
  @Post()
  async create(
    @Body() createEnrollmentDto: CreateEnrollmentDto,
  ): Promise<EnrollmentEntity> {
    return this.service.create(createEnrollmentDto);
  }

  @ApiOkResponse({ type: [EnrollmentEntity] })
  @HttpCode(HttpStatus.OK)
  @Get()
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'userId', required: false, type: String })
  @ApiQuery({ name: 'courseId', required: false, type: String })
  @ApiQuery({
    name: 'status',
    required: false,
    enum: ['active', 'completed', 'cancelled'],
  })
  async findAll(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
    @Query('userId') userId?: string,
    @Query('courseId') courseId?: string,
    @Query('status') status?: 'active' | 'completed' | 'cancelled',
  ): Promise<EnrollmentEntity[]> {
    const filterOptions: FilterEnrollmentDto = {};
    const paginationOptions: IPaginationOptions = {
      page: Number(page),
      limit: Number(limit),
    };

    if (userId) filterOptions.userId = userId;
    if (courseId) filterOptions.courseId = courseId;
    if (status) filterOptions.status = status;

    const sortOptions: SortEnrollmentDto[] = [
      { orderBy: 'createdAt', order: 'DESC' },
    ];

    return this.service.findAll({
      filterOptions,
      sortOptions,
      paginationOptions,
    });
  }

  @ApiOkResponse({ type: EnrollmentEntity })
  @ApiParam({
    name: 'id',
    type: String,
    required: true,
  })
  @HttpCode(HttpStatus.OK)
  @Get(':id')
  async findOne(@Param('id') id: string): Promise<EnrollmentEntity | null> {
    return this.service.findOne(id);
  }

  @ApiOkResponse({ type: EnrollmentEntity })
  @ApiParam({
    name: 'userId',
    type: String,
    required: true,
  })
  @ApiParam({
    name: 'courseId',
    type: String,
    required: true,
  })
  @HttpCode(HttpStatus.OK)
  @Get('user/:userId/course/:courseId')
  async findByUserAndCourse(
    @Param('userId') userId: string,
    @Param('courseId') courseId: string,
  ): Promise<EnrollmentEntity | null> {
    return this.service.findByUserAndCourse(userId, courseId);
  }

  @ApiOkResponse({ type: EnrollmentEntity })
  @ApiParam({
    name: 'id',
    type: String,
    required: true,
  })
  @HttpCode(HttpStatus.OK)
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateEnrollmentDto: UpdateEnrollmentDto,
  ): Promise<EnrollmentEntity | null> {
    return this.service.update(id, updateEnrollmentDto);
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
