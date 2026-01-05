import {
  BadRequestException,
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
  Res,
  NotFoundException,
} from '@nestjs/common';

import { Response } from 'express';
import * as path from 'path';
import * as fs from 'fs';

import {
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';

import { BulkMarkAssignmentDto } from './dto/bulk-mark-assigment.dto';
import { AssignmentCheckPassFailDto } from './dto/assigment-check-pass-fail.dto';
import { AssignmentService } from './assigment.service';
import { AssigmentEntity } from './domain/assigment.entity';
import { CreateAssignmentDto } from './dto/create-assignment.dto';
import { UpdateAssignmentDto } from './dto/update-assignment.dto';

import { ApprovePassFailDto } from './dto/approve-pass-fail.dto';
import { AssignmentPassFailRecordEntity } from './domain/pass-fail-record.entity';
import { FilterAttendanceDto } from '../attendance/dto/query-attendance.dto';
import { CheckPassFailDto } from './dto/check-pass-fail.dto';

@ApiTags('Assigment')
@Controller({
  path: 'assigment',
  version: '1',
})
export class AssigmentController {
  constructor(private readonly assigmentService: AssignmentService) {}

  @ApiOperation({
    summary: 'Mark attendance for a single student',
    description:
      'Instructor marks attendance for one student in a class schedule.',
  })
  @ApiCreatedResponse({
    description: 'Attendance marked successfully',
    type: AssigmentEntity,
  })
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() dto: CreateAssignmentDto) {
    
    return await this.assigmentService.create(dto, dto.markedBy);
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  async findAll(@Query() filters: FilterAttendanceDto) {
    return await this.assigmentService.findAll(filters);
  }

  @Get('paginated/list')
  @HttpCode(HttpStatus.OK)
  async findPaginated(@Query() query: any) {
    const page = query?.page ?? 1;
    let limit = query?.limit ?? 10;
    if (limit > 50) limit = 50;

    const filterOptions: FilterAttendanceDto = {
      courseId: query?.courseId,
      sessionId: query?.sessionId,
      studentId: query?.studentId,
      markedBy: query?.markedBy,
      status: query?.status,
    };

    return await this.assigmentService.findManyWithPagination({
      filterOptions,
      sortOptions: query?.sort,
      paginationOptions: {
        page: Number(page),
        limit: Number(limit),
      },
    });
  }

  @Post('pass-fail-approve-certificate')
  @HttpCode(HttpStatus.OK)
  async approvePassFail(
    @Body() dto: ApprovePassFailDto,
    // TODO: Get operatorId from authesnticated user (auth guard) instead of DTO
  ) {
    if (!dto.operatorId) {
      throw new BadRequestException('Operator ID is required');
    }
    return await this.assigmentService.approvePassFailStatus(
      dto,
      dto.operatorId,
    );
  }



  @Get('pass-fail-check-assigment')
  @HttpCode(HttpStatus.OK)
  async checkPassFail(@Query() query: CheckPassFailDto) {
    console.log(query, "issueCertificates")
    return await this.assigmentService.checkPassFailStatus(query);
  }
}
