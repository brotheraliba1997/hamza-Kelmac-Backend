import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { CorporateScheduleService } from './corporateSchedule.services';
import { CreateCorporateScdeduleDto } from './dto/create-corporateSchedule';

@ApiTags('Corporate Schedule')
@Controller('v1/corporate-schedule')
export class CorporateScheduleController {
  constructor(
    private readonly corporateScheduleService: CorporateScheduleService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Create a new corporate schedule' })
  @ApiResponse({
    status: 201,
    description: 'Corporate schedule created successfully.',
  })
  create(@Body() dto: CreateCorporateScdeduleDto) {
    return this.corporateScheduleService.create(dto);
  }

  //   @Get()
  //   @ApiOperation({ summary: 'Get all corporate schedules' })
  //   findAll() {
  //     return this.corporateScheduleService.findAll();
  //   }

  //   @Get(':id')
  //   @ApiOperation({ summary: 'Get corporate schedule by ID' })
  //   findOne(@Param('id') id: string) {
  //     return this.corporateScheduleService.findOne(id);
  //   }
}
