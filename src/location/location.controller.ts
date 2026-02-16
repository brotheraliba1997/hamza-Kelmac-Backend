import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiOkResponse,
  ApiQuery,
} from '@nestjs/swagger';
import { LocationService } from './location.service';
import { LocationEntity } from './location.entity';
import { FilterLocationDto, QueryLocationDto } from './dto/query-location.dto';
import {
  InfinityPaginationResponse,
  InfinityPaginationResponseDto,
} from '../utils/dto/infinity-pagination-response.dto';

@ApiTags('Locations')
@Controller({ version: '1', path: 'location' })
export class LocationController {
  constructor(private readonly locationService: LocationService) {}

  @ApiOperation({ summary: 'Create a new location' })
  @ApiOkResponse({ type: LocationEntity })
  @Post()
  async create(@Body() data: LocationEntity) {
    return this.locationService.create(data);
  }

  @ApiOperation({ summary: 'Get all locations with pagination and search' })
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
    name: 'search',
    required: false,
    type: String,
    description: 'Search in country and country code',
  })
  @ApiQuery({
    name: 'country',
    required: false,
    type: String,
    description: 'Filter by country name',
  })
  @ApiQuery({
    name: 'countryCode',
    required: false,
    type: String,
    description: 'Filter by country code',
  })
  @ApiQuery({
    name: 'currency',
    required: false,
    type: String,
    description: 'Filter by currency',
  })
  @ApiOkResponse({
    type: InfinityPaginationResponse(LocationEntity),
  })
  @Get()
  @HttpCode(HttpStatus.OK)
  async findAll(@Query() queryDto: FilterLocationDto & QueryLocationDto) {
    const page = queryDto?.page ?? 1;
    let limit = queryDto?.limit ?? 10;
    if (limit > 50) {
      limit = 50;
    }

    return this.locationService.findManyWithPagination({
      filterOptions: queryDto,
      sortOptions: null,
      paginationOptions: {
        page: Number(page),
        limit: Number(limit),
      },
    });
  }

  @ApiOperation({ summary: 'Get location by country name' })
  @ApiOkResponse({ type: LocationEntity })
  @Get(':country')
  async findByCountry(@Param('country') country: string) {
    return this.locationService.findByCountry(country);
  }
}
