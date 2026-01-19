import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';

import { StudentItemGradeService } from './student-item-grade.service';

import { UpdateStudentItemGradeDto } from './dto/update-student-item-grade.dto';
import { createManyStudentItemGradeDto, CreateStudentItemGradeDto } from './dto/create-student-item-grade.dto';

@ApiTags('Student Item Grades')
@Controller({
  path: 'student-item-grades',
  version: '1',
})
export class StudentItemGradeController {
  constructor(private readonly gradeService: StudentItemGradeService) {}

  @Post()
  @ApiOperation({ summary: 'Create or update student item grade' })
  createOrUpdate(@Body() dto: createManyStudentItemGradeDto) {
    console.log(dto);
    return this.gradeService.createOrUpdate(dto);
  }

  @Get('student/:studentId')
  @ApiOperation({ summary: 'Get all grades of a student' })
  findByStudent(@Param('studentId') studentId: string) {
    return this.gradeService.findByStudent(studentId);
  }

  // @Get('assessment/:assessmentItemId')
  // @ApiOperation({ summary: 'Get grades for an assessment item' })
  // findByAssessment(
  //   @Param('assessmentItemId') assessmentItemId: string,
  // ) {
  //   return this.gradeService.findByAssessmentItem(assessmentItemId);
  // }

  @Patch(':id')
  @ApiOperation({ summary: 'Update obtained marks' })
  update(@Param('id') id: string, @Body() dto: UpdateStudentItemGradeDto) {
    return this.gradeService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete student item grade' })
  remove(@Param('id') id: string) {
    return this.gradeService.remove(id);
  }
}
