import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import {
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { EnquiriesService } from './enquiries.service';
import { CreateEnquiryDto } from './dto/create-enquiry.dto';
import { UpdateEnquiryDto } from './dto/update-enquiry.dto';
import { EnquiryEntity } from './domain/enquiry.entity';
import {
  InfinityPaginationResponse,
  InfinityPaginationResponseDto,
} from '../utils/dto/infinity-pagination-response.dto';
import { FilterEnquiryDto, QueryEnquiryDto } from './dto/query-enquiry.dto';

@ApiTags('Enquiries')
@Controller({ version: '1', path: 'enquiries' })
export class EnquiriesController {
  constructor(private readonly service: EnquiriesService) {}

  @ApiOperation({ summary: 'Create a new enquiry' })
  @ApiOkResponse({ type: EnquiryEntity })
  @Post()
  async create(@Body() dto: CreateEnquiryDto) {
    return this.service.create(dto);
  }

  @ApiOperation({ summary: 'Get enquiries with pagination and search' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiOkResponse({ type: InfinityPaginationResponse(EnquiryEntity) })
  @Get()
  @HttpCode(HttpStatus.OK)
  async findAll(@Query() queryDto: FilterEnquiryDto & QueryEnquiryDto) {
    const page = queryDto?.page ?? 1;
    let limit = queryDto?.limit ?? 10;
    if (limit > 50) limit = 50;

    return this.service.findManyWithPagination({
      filterOptions: queryDto,
      sortOptions: null,
      paginationOptions: { page: Number(page), limit: Number(limit) },
    });
  }

  @ApiOperation({ summary: 'Get single enquiry by ID' })
  @ApiParam({ name: 'id', type: String })
  @ApiOkResponse({ type: EnquiryEntity })
  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @ApiOperation({ summary: 'Update an enquiry by ID' })
  @ApiParam({ name: 'id', type: String })
  @ApiOkResponse({ type: EnquiryEntity })
  @Patch(':id')
  async update(@Param('id') id: string, @Body() dto: UpdateEnquiryDto) {
    return this.service.update(id, dto);
  }

  @ApiOperation({ summary: 'Delete an enquiry by ID' })
  @ApiParam({ name: 'id', type: String })
  @ApiOkResponse({ type: InfinityPaginationResponseDto })
  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
