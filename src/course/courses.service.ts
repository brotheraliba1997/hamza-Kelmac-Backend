import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Course, CourseDocument } from '../schema/Course/course.schema';
import { CreateCourseDto } from './dto/create-course.dto';
import { UpdateCourseDto } from './dto/update-course.dto';
import {
  CourseSchemaClass,
  CourseSchemaDocument,
} from './infrastructure/persistence/document/entities/course.schema';
import { CourseRepository } from './infrastructure/persistence/courses.repository';
import { FilterCourseDto, SortCourseDto } from './dto/query-course.dto';
import { IPaginationOptions } from '../utils/types/pagination-options';
import { CourseEntity } from './domain/course';
import { NullableType } from '../utils/types/nullable.type';

@Injectable()
export class CoursesService {
  constructor(private readonly courseRepository: CourseRepository) {}

  // create(dto: CreateCourseDto) {
  create(dto: any) {
    return this.courseRepository.create(dto);
  }

  // findAll() {
  //   return this.model.find().populate('instructor', 'name email').lean();
  // }
  findManyWithPagination({
    filterOptions,
    sortOptions,
    paginationOptions,
  }: {
    filterOptions?: FilterCourseDto | null;
    sortOptions?: SortCourseDto[] | null;
    paginationOptions: IPaginationOptions;
  }): Promise<CourseEntity[]> {
    return this.courseRepository.findManyWithPagination({
      filterOptions,
      sortOptions,
      paginationOptions,
    });
  }
  findById(id: CourseEntity['id']): Promise<NullableType<CourseEntity>> {
    return this.courseRepository.findById(id);
  }

  update(id: string, dto: UpdateCourseDto) {
    return this.courseRepository.update(id, dto);
  }

  remove(id: string) {
    return this.courseRepository.remove(id);
  }
}
