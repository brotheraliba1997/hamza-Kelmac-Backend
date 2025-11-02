import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiQuery,
} from '@nestjs/swagger';
import { EnrollmentService } from './enrollment.service';
import { CreateEnrollmentDto } from './dto/create-enrollment.dto';
import { Enrollment } from './interfaces/enrollment.interface';
import { infinityPagination } from '../utils/infinity-pagination';
import {
  InfinityPaginationResponse,
  InfinityPaginationResponseDto,
} from '../utils/dto/infinity-pagination-response.dto';

@ApiTags('enrollments')
@Controller('enrollment')
export class EnrollmentController {
  constructor(private readonly enrollmentService: EnrollmentService) {}

  @Post()
  @ApiCreatedResponse({ description: 'The enrollment has been created.' })
  async create(
    @Body() createEnrollmentDto: CreateEnrollmentDto,
  ): Promise<Enrollment> {
    return this.enrollmentService.create(createEnrollmentDto);
  }

  @Get()
  @ApiOkResponse({ description: 'Returns all enrollments.' })
  async findAll(): Promise<Enrollment[]> {
    return this.enrollmentService.findAll();
  }

  @Get('paginated')
  @ApiOkResponse({
    description: 'Returns paginated enrollments with filtering and sorting.',
  })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'userId', required: false, type: String })
  @ApiQuery({ name: 'courseId', required: false, type: String })
  @ApiQuery({ name: 'status', required: false, type: String })
  @HttpCode(HttpStatus.OK)
  async findPaginated(@Query() query: any) {
    const page = query?.page ?? 1;
    let limit = query?.limit ?? 10;
    if (limit > 50) {
      limit = 50;
    }

    return this.enrollmentService.findManyWithPagination({
      filterOptions: {
        userId: query?.userId,
        courseId: query?.courseId,
        status: query?.status,
      },
      sortOptions: query?.sort,
      paginationOptions: {
        page,
        limit,
      },
    });
  }

  @Get(':id')
  @ApiOkResponse({ description: 'Returns a single enrollment.' })
  async findOne(@Param('id') id: string): Promise<Enrollment | undefined> {
    return this.enrollmentService.findOne(id);
  }

  @Patch(':id')
  @ApiOkResponse({ description: 'The enrollment has been updated.' })
  async update(
    @Param('id') id: string,
    @Body() updateEnrollmentDto: Partial<CreateEnrollmentDto>,
  ): Promise<Enrollment | undefined> {
    return this.enrollmentService.update(id, updateEnrollmentDto);
  }

  @Delete(':id')
  @ApiOkResponse({ description: 'The enrollment has been deleted.' })
  async remove(@Param('id') id: string): Promise<{ deleted: boolean }> {
    const deleted = await this.enrollmentService.remove(id);
    return { deleted };
  }
}
