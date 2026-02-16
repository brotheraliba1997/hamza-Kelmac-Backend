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
} from '@nestjs/common';
import {
  ApiCreatedResponse,
  ApiOkResponse,
  ApiParam,
  ApiTags,
  ApiOperation,
  ApiBody,
  ApiResponse,
} from '@nestjs/swagger';
import { BundleOfferService } from './bundle-offer.services';
import { CreateBundleOfferDto } from './dto/create-bundle-offer.dto';
import { UpdateBundleOfferDto } from './dto/update-bundle-offer.dto';

@ApiTags('Bundle Offers')
@Controller({
  path: 'bundle-offers',
  version: '1',
})
export class BundleOfferController {
  constructor(private readonly service: BundleOfferService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new bundle offer' })
  @ApiBody({ type: CreateBundleOfferDto })
  @ApiCreatedResponse({ description: 'Bundle offer created successfully' })
  @ApiResponse({ status: 400, description: 'Bad request - validation failed' })
  create(@Body() dto: CreateBundleOfferDto) {
    return this.service.create(dto);
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get all bundle offers' })
  @ApiOkResponse({ description: 'List of all bundle offers' })
  findAll() {
    return this.service.findAll();
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get bundle offer by ID' })
  @ApiParam({
    name: 'id',
    type: String,
    description: 'Bundle offer MongoDB ObjectId',
  })
  @ApiOkResponse({ description: 'Bundle offer found' })
  @ApiResponse({ status: 404, description: 'Bundle offer not found' })
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Update bundle offer' })
  @ApiParam({
    name: 'id',
    type: String,
    description: 'Bundle offer MongoDB ObjectId',
  })
  @ApiBody({ type: UpdateBundleOfferDto })
  @ApiOkResponse({ description: 'Bundle offer updated successfully' })
  @ApiResponse({ status: 404, description: 'Bundle offer not found' })
  update(@Param('id') id: string, @Body() dto: UpdateBundleOfferDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete bundle offer' })
  @ApiParam({
    name: 'id',
    type: String,
    description: 'Bundle offer MongoDB ObjectId',
  })
  @ApiOkResponse({ description: 'Bundle offer deleted successfully' })
  @ApiResponse({ status: 404, description: 'Bundle offer not found' })
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
