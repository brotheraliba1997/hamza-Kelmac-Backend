import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { ApiTags, ApiCreatedResponse, ApiOkResponse } from '@nestjs/swagger';
import { EnrollmentService } from './enrollment.service';
import { CreateEnrollmentDto } from './dto/create-enrollment.dto';
import { Enrollment } from './interfaces/enrollment.interface';

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
