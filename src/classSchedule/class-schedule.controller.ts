import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Put,
  Query,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { randomUUID } from 'crypto';

import { CreateClassScheduleDto } from './dto/create-class-schedule.dto';
import { UpdateClassScheduleDto } from './dto/update-class-schedule.dto';
import {
  FilterClassScheduleDto,
  SortClassScheduleDto,
} from './dto/query-class-schedule.dto';
import { ClassScheduleService } from './class-schedule.service';

@ApiTags('Class Schedule')
@Controller('class-schedule')
export class ClassScheduleController {
  constructor(private readonly classScheduleService: ClassScheduleService) {}

  // 📘 Create new class schedule
  @Post()
  @ApiOperation({ summary: 'Create a new class schedule' })
  @ApiResponse({ status: 201, description: 'Class schedule created successfully.' })
  create(@Body() dto: CreateClassScheduleDto) {
    dto.securityKey = randomUUID();
    return  this.classScheduleService.create(dto);
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

  // 📘 Get one class schedule by ID
  @Get(':id')
  @ApiOperation({ summary: 'Get a specific class schedule by ID' })
  @ApiResponse({ status: 200, description: 'Class schedule retrieved successfully.' })
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
