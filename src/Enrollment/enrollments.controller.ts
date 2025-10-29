import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { CreateEnrollmentDto } from './dto/create-enrollment.dto';
import { EnrollmentsService } from './enrollments.service';

@ApiBearerAuth()
@ApiTags('Enrollments')
@Controller({
  path: 'enrollments',
  version: '1',
})
export class EnrollmentsController {
  constructor(private readonly service: EnrollmentsService) {}

  @ApiCreatedResponse()
  @HttpCode(HttpStatus.CREATED)
  @Post()
  create(@Body() dto: CreateEnrollmentDto) {
    return this.service.create(dto);
  }

  @ApiOkResponse()
  @HttpCode(HttpStatus.OK)
  @Get()
  findAll() {
    return this.service.findAll();
  }

  @ApiOkResponse()
  @ApiParam({
    name: 'userId',
    type: String,
    required: true,
  })
  @HttpCode(HttpStatus.OK)
  @Get('user/:userId')
  findByUser(@Param('userId') userId: string) {
    return this.service.findUserEnrollments(userId);
  }

  @ApiOkResponse()
  @ApiParam({
    name: 'id',
    type: String,
    required: true,
  })
  @HttpCode(HttpStatus.OK)
  @Patch(':id/progress')
  updateProgress(@Param('id') id: string, @Body('progress') progress: number) {
    return this.service.updateProgress(id, progress);
  }
}
