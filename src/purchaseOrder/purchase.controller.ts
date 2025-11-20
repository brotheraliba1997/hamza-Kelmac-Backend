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
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { PurchaseOrderService } from './purchase.services';
import { CreatePurchaseOrderDto } from './dto/create-purchase.dto';
import { UpdatePurchaseOrderDto } from './dto/update-purchase.dto';
import { PurchaseOrderStatusEnum } from './schema/purchase.schema';
import { PurchaseOrderEntity } from './domain/purchase-order.entity';

@ApiTags('Purchase Orders')
@Controller({
  path: 'purchase-orders',
  version: '1',
})
export class PurchaseOrderController {
  constructor(private readonly purchaseOrderService: PurchaseOrderService) {}

  @ApiOperation({
    summary: 'Create purchase order',
    description:
      'Student/counselor submits a purchase order request with bank slip attachment info.',
  })
  @ApiCreatedResponse({
    description: 'Purchase order created successfully',
    type: PurchaseOrderEntity,
  })
  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() dto: CreatePurchaseOrderDto) {
    return this.purchaseOrderService.create(dto);
  }

  @ApiOperation({
    summary: 'List purchase orders',
    description:
      'Finance team can filter by status to prioritize pending approvals.',
  })
  @ApiQuery({
    name: 'status',
    required: false,
    enum: PurchaseOrderStatusEnum,
    description: 'Filter purchase orders by workflow status',
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
    description: 'Items per page (default: 10)',
  })
  @ApiOkResponse({
    description: 'Paginated list of purchase orders',
    type: [PurchaseOrderEntity],
  })
  @Get()
  @HttpCode(HttpStatus.OK)
  findAll(
    @Query('status') status?: PurchaseOrderStatusEnum,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    const paginationOptions = {
      page: page ? Number(page) : 1,
      limit: limit ? Number(limit) : 10,
    };
    return this.purchaseOrderService.findAll(status, paginationOptions);
  }

  @ApiOperation({
    summary: 'Get purchase order by ID',
  })
  @ApiParam({
    name: 'id',
    description: 'Purchase order MongoDB ObjectId',
    type: String,
  })
  @ApiOkResponse({
    description: 'Purchase order details',
    type: PurchaseOrderEntity,
  })
  @Get(':id')
  @HttpCode(HttpStatus.OK)
  findOne(@Param('id') id: string) {
    return this.purchaseOrderService.findOne(id);
  }

  @ApiOperation({
    summary: 'Update / review purchase order',
    description:
      'Finance reviewers can approve/reject and add decision notes via this endpoint.',
  })
  @ApiParam({
    name: 'id',
    description: 'Purchase order MongoDB ObjectId',
    type: String,
  })
  @ApiOkResponse({
    description: 'Updated purchase order',
    type: PurchaseOrderEntity,
  })
  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  update(@Param('id') id: string, @Body() dto: UpdatePurchaseOrderDto) {
    return this.purchaseOrderService.update(id, dto);
  }

  @ApiOperation({
    summary: 'Delete purchase order',
  })
  @ApiParam({
    name: 'id',
    description: 'Purchase order MongoDB ObjectId',
    type: String,
  })
  @ApiOkResponse({
    description: 'Purchase order deleted',
    schema: {
      example: { deleted: true },
    },
  })
  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  remove(@Param('id') id: string) {
    return this.purchaseOrderService.remove(id);
  }
}
