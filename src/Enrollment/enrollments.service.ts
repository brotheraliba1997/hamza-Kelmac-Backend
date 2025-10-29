import { Injectable, ConflictException } from '@nestjs/common';
import { CreateEnrollmentDto } from './dto/create-enrollment.dto';
import { UpdateEnrollmentDto } from './dto/update-enrollment.dto';
import { EnrollmentEntity } from './domain/enrollment';
import { IPaginationOptions } from '../utils/types/pagination-options';
import {
  FilterEnrollmentDto,
  SortEnrollmentDto,
} from './dto/query-enrollment.dto';
import { EnrollmentRepository } from './infrastructure/persistence/enrollments.repository';

@Injectable()
export class EnrollmentsService {
  constructor(private readonly enrollmentRepository: EnrollmentRepository) {}

  async create(
    createEnrollmentDto: any,
    // createEnrollmentDto: CreateEnrollmentDto,
  ): Promise<EnrollmentEntity> {
    // Check if enrollment already exists

    console.log('createEnrollmentDto:', createEnrollmentDto);
    const existingEnrollment =
      await this.enrollmentRepository.findByUserAndCourse(
        createEnrollmentDto.user,
        createEnrollmentDto.course,
      );

    if (existingEnrollment) {
      throw new ConflictException('User is already enrolled in this course');
    }

    // const enrollmentEntity = new EnrollmentEntity(createEnrollmentDto);

    return await this.enrollmentRepository.create(createEnrollmentDto);
  }

  async findAll({
    filterOptions,
    sortOptions,
    paginationOptions,
  }: {
    filterOptions?: FilterEnrollmentDto;
    sortOptions?: SortEnrollmentDto[];
    paginationOptions: IPaginationOptions;
  }): Promise<EnrollmentEntity[]> {
    return await this.enrollmentRepository.findManyWithPagination({
      filterOptions,
      sortOptions,
      paginationOptions,
    });
  }

  async findOne(id: string): Promise<EnrollmentEntity | null> {
    return this.enrollmentRepository.findById(id);
  }

  async findByUserAndCourse(
    userId: string,
    courseId: string,
  ): Promise<EnrollmentEntity | null> {
    return this.enrollmentRepository.findByUserAndCourse(userId, courseId);
  }

  async findByUser(
    userId: string,
    paginationOptions: IPaginationOptions,
  ): Promise<EnrollmentEntity[]> {
    return this.enrollmentRepository.findManyWithPagination({
      filterOptions: { userId },
      sortOptions: [{ orderBy: 'createdAt', order: 'DESC' }],
      paginationOptions,
    });
  }

  async update(
    id: string,
    updateEnrollmentDto: UpdateEnrollmentDto,
  ): Promise<EnrollmentEntity | null> {
    // If updating progress to 100%, automatically set as completed
    if (updateEnrollmentDto.progress === 100) {
      updateEnrollmentDto.status = 'completed';
      updateEnrollmentDto.completionDate = new Date();
    }

    return this.enrollmentRepository.update(id, updateEnrollmentDto);
  }

  async remove(id: string): Promise<void> {
    return this.enrollmentRepository.remove(id);
  }
}
