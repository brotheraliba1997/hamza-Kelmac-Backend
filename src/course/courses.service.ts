import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateCourseDto } from './dto/create-course.dto';
import { UpdateCourseDto } from './dto/update-course.dto';
import { CourseSchemaClass } from './schema/course.schema';
import { FilterCourseDto, SortCourseDto } from './dto/query-course.dto';
import { IPaginationOptions } from '../utils/types/pagination-options';
import { CourseEntity } from './domain/course';
import { NullableType } from '../utils/types/nullable.type';
import {
  buildMongooseQuery,
  FilterQueryBuilder,
  PaginationResult,
} from '../utils/mongoose-query-builder';
import { MailService } from '../mail/mail.service';
import { ConfigService } from '@nestjs/config';
import { AllConfigType } from '../config/config.type';
import { UserSchemaClass } from '../users/schema/user.schema';
import {
  convertIdToString,
  sanitizeMongooseDocument,
} from '../utils/convert-id';

@Injectable()
export class CoursesService {
  constructor(
    @InjectModel(CourseSchemaClass.name)
    private readonly courseModel: Model<CourseSchemaClass>,
    private readonly mailService: MailService,
    private readonly configService: ConfigService<AllConfigType>,
  ) {}

  private map(doc: any): CourseEntity {
    if (!doc) return undefined as any;

    // Sanitize the document to convert all IDs and nested objects
    const sanitized = sanitizeMongooseDocument(doc);

    // Double-check sanitized is not null
    if (!sanitized) return undefined as any;

    return new CourseEntity({
      id: sanitized.id || convertIdToString(doc),
      title: sanitized.title,
      description: sanitized.description,
      instructor:
        typeof sanitized.instructor === 'object' && sanitized.instructor
          ? sanitized.instructor.id || sanitized.instructor
          : sanitized.instructor,
      modules: sanitized.modules || [],
      price: sanitized.price,
      enrolledCount: sanitized.enrolledCount,
      isPublished: sanitized.isPublished,
      createdAt: sanitized.createdAt,
      updatedAt: sanitized.updatedAt,
      deletedAt: sanitized.deletedAt ?? null,
    });
  }

  async create(dto: CreateCourseDto): Promise<CourseEntity> {
    const created = await this.courseModel.create(dto);

    // Populate instructor for email
    const populatedCourse = await this.courseModel
      .findById(created._id)
      .populate('instructor')
      .lean();

    if (populatedCourse) {
      const instructor = populatedCourse.instructor as any;
      const adminEmail = this.configService.get('app.adminEmail', {
        infer: true,
      });

      const emailData = {
        courseTitle: populatedCourse.title,
        instructorName: instructor?.firstName
          ? `${instructor.firstName} ${instructor.lastName || ''}`
          : instructor?.email || 'Unknown Instructor',
        description: populatedCourse.description,
        price: populatedCourse.price,
        courseUrl: `${this.configService.get('app.frontendDomain', { infer: true })}/courses/${created._id}`,
      };

      try {
        // Send email to admin
        if (adminEmail) {
          await this.mailService.courseCreated({
            to: adminEmail,
            data: emailData,
          });
        }

        // Send email to instructor (course creator)
        if (instructor?.email) {
          await this.mailService.courseCreated({
            to: instructor.email,
            data: emailData,
          });
        }
      } catch (error) {
        // Log error but don't fail course creation
        console.error('Failed to send course creation emails:', error);
      }
    }

    // Convert Mongoose document to plain object before mapping
    const createdLean = created.toObject();
    return this.map(createdLean);
  }

  async findManyWithPagination({
    filterOptions,
    sortOptions,
    paginationOptions,
  }: {
    filterOptions?: FilterCourseDto | null;
    sortOptions?: SortCourseDto[] | null;
    paginationOptions: IPaginationOptions;
  }): Promise<PaginationResult<CourseEntity>> {
    // Build filter query using FilterQueryBuilder
    const filterQuery = new FilterQueryBuilder<CourseSchemaClass>()
      .addEqual('instructor' as any, filterOptions?.instructorId)
      .addEqual('isPublished' as any, filterOptions?.isPublished)
      .addRange(
        'price' as any,
        filterOptions?.minPrice,
        filterOptions?.maxPrice,
      )
      .build();

    // Use buildMongooseQuery utility
    return buildMongooseQuery({
      model: this.courseModel,
      filterQuery,
      sortOptions,
      paginationOptions,
      populateFields: [{ path: 'instructor', select: 'name email' }],
      mapper: (doc) => this.map(doc),
    });
  }

  async findById(id: CourseEntity['id']): Promise<NullableType<CourseEntity>> {
    const doc = await this.courseModel
      .findById(id)
      .populate('instructor', 'name email')
      .lean();
    return doc ? this.map(doc) : null;
  }

  async update(id: string, dto: UpdateCourseDto): Promise<CourseEntity | null> {
    const doc = await this.courseModel
      .findByIdAndUpdate(id, dto, { new: true })
      .populate('instructor', 'name email')
      .lean();
    return doc ? this.map(doc) : null;
  }

  async remove(id: string): Promise<void> {
    await this.courseModel.deleteOne({ _id: id });
  }
}
