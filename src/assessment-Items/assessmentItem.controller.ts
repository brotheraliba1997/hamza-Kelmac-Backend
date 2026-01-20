import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CreateAssessmentItemDto } from './dto/create-assessment-Item.dto';

import { AssessmentItem } from './schema/assessmentItem.schema';
import { AssessmentItemService } from './assessmentItem.services';
import { UpdateAssessmentItemDto } from './dto/update-assessment-item.dto';

@ApiTags('Assessment Items')
@Controller({
  path: 'assessment-items',
  version: '1',
})
export class AssessmentItemController {
  constructor(private readonly service: AssessmentItemService) {}

  @Post()
  create(@Body() dto: CreateAssessmentItemDto): Promise<AssessmentItem> {
    return this.service.create(dto);
  }
  // ssssss

  @Get()
  findAll(): Promise<AssessmentItem[]> {
    return this.service.findAll();
  }

  @Get('course/:courseId/day/:day')
  findByCourse(
    @Param('courseId') courseId: string,
    @Param('day') day: string,
  ): Promise<{ data: AssessmentItem[] }> {
    return this.service.findByCourse(courseId, day);
  }

  @Get(':id')
  findOne(@Param('id') id: string): Promise<AssessmentItem> {
    return this.service.findOne(id);
  }

  @Get('test/:testId')
  findByTest(@Param('testId') testId: string): Promise<AssessmentItem[]> {
    return this.service.findByTest(testId);
  }

  @Put(':id')
  update(
    @Param('id') id: string,
    @Body() dto: UpdateAssessmentItemDto,
  ): Promise<AssessmentItem> {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string): Promise<void> {
    return this.service.remove(id);
  }
}
