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
  ApiOperation,
} from '@nestjs/swagger';
import { CertificatesService } from './certificates.service';
import { CreateCertificateDto } from './dto/create-certificate.dto';
import { UpdateCertificateDto } from './dto/update-certificate.dto';
import { infinityPagination } from '../utils/infinity-pagination';
import { InfinityPaginationResponseDto } from '../utils/dto/infinity-pagination-response.dto';

@ApiBearerAuth()
@ApiTags('Certificates')
@Controller({
  path: 'certificates',
  version: '1',
})
export class CertificatesController {
  constructor(private readonly service: CertificatesService) {}

  @ApiCreatedResponse()
  @HttpCode(HttpStatus.CREATED)
  @Post()
  create(@Body() dto: CreateCertificateDto) {
    return this.service.create(dto);
  }

  @ApiOkResponse()
  @HttpCode(HttpStatus.OK)
  @Get()
  findAll() {
    return this.service.findAll();
  }

  @Get('paginated/list')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get paginated certificates with filters' })
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
    name: 'userId',
    required: false,
    type: String,
    description: 'Filter by user ID',
  })
  @ApiQuery({
    name: 'courseId',
    required: false,
    type: String,
    description: 'Filter by course ID',
  })
  async findPaginated(@Query() query: any) {
    const page = query?.page ?? 1;
    let limit = query?.limit ?? 10;
    if (limit > 50) {
      limit = 50;
    }

    const filterOptions = {
      userId: query?.userId,
      courseId: query?.courseId,
    };

    return this.service.findManyWithPagination({
      filterOptions,
      sortOptions: query?.sort,
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
    return this.service.findOne(id);
  }

  @ApiOkResponse()
  @ApiParam({
    name: 'id',
    type: String,
    required: true,
  })
  @HttpCode(HttpStatus.OK)
  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateCertificateDto) {
    return this.service.update(id, dto);
  }

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
