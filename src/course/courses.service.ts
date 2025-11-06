import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
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
import { CategoriesService } from '../category/categories.service';

@Injectable()
export class CoursesService {
  constructor(
    @InjectModel(CourseSchemaClass.name)
    private readonly courseModel: Model<CourseSchemaClass>,
    private readonly mailService: MailService,
    private readonly configService: ConfigService<AllConfigType>,
    private readonly categoriesService: CategoriesService,
  ) {}

  /**
   * Generate slug from title
   */
  private generateSlug(title: string): string {
    return title
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  /**
   * Ensure slug is unique by appending a number if necessary
   */
  private async ensureUniqueSlug(
    slug: string,
    excludeId?: string,
  ): Promise<string> {
    let uniqueSlug = slug;
    let counter = 1;

    while (true) {
      const query: any = { slug: uniqueSlug };
      if (excludeId) {
        query._id = { $ne: excludeId };
      }

      const existing = await this.courseModel.findOne(query).lean();

      if (!existing) {
        return uniqueSlug;
      }

      uniqueSlug = `${slug}-${counter}`;
      counter++;
    }
  }

  private map(doc: any): CourseEntity {
    if (!doc) return undefined as any;

    // Sanitize the document to convert all IDs and nested objects
    const sanitized = sanitizeMongooseDocument(doc);

    // Double-check sanitized is not null
    if (!sanitized) return undefined as any;

    return new CourseEntity({
      ...sanitized,
      id: sanitized.id || convertIdToString(doc),
      title: sanitized.title,
      slug: sanitized.slug,
      description: sanitized.description,
      instructor: sanitized.instructor,
      // typeof sanitized.instructor === 'object' && sanitized.instructor
      //   ? sanitized.instructor.id || sanitized.instructor
      //   : sanitized.instructor,
      // modules: sanitized.modules || [],
      price: sanitized.price,
      enrolledCount: sanitized.enrolledCount,
      isPublished: sanitized.isPublished,
      createdAt: sanitized.createdAt,
      updatedAt: sanitized.updatedAt,
      deletedAt: sanitized.deletedAt ?? null,
    });
  }

  async create(dto: CreateCourseDto): Promise<CourseEntity> {
    // Generate slug if not provided
    const baseSlug = dto.slug || this.generateSlug(dto.title);
    const uniqueSlug = await this.ensureUniqueSlug(baseSlug);

    // Validate category exists and is active
    if (dto.category) {
      try {
        const category = await this.categoriesService.findOne(dto.category);
        if (!category || !category.isActive) {
          throw new BadRequestException(
            `Category "${dto.category}" not found or is inactive`,
          );
        }
      } catch (error) {
        if (error instanceof NotFoundException) {
          throw new BadRequestException(
            `Category "${dto.category}" does not exist`,
          );
        }
        throw error;
      }
    }

    const created = await this.courseModel.create({
      ...dto,
      slug: uniqueSlug,
    });

    // Increment category course count
    if (dto.category) {
      try {
        await this.categoriesService.incrementCourseCount(dto.category);
      } catch (error) {
        console.error('Failed to increment category course count:', error);
      }
    }

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
      .addEqual('category' as any, filterOptions?.category)
      .addEqual('isPublished' as any, filterOptions?.isPublished)
      .addEqual('isFeatured' as any, filterOptions?.isFeatured)
      .addEqual('isBestseller' as any, filterOptions?.isBestseller)
      .addEqual('isNew' as any, filterOptions?.isNew)
      .addRange(
        'price' as any,
        filterOptions?.minPrice,
        filterOptions?.maxPrice,
      )
      .build();

    // Add additional filters
    const additionalFilters: any = {};

    if (filterOptions?.subcategory) {
      additionalFilters.subcategories = filterOptions.subcategory;
    }

    if (filterOptions?.topic) {
      additionalFilters.topics = filterOptions.topic;
    }

    if (filterOptions?.minRating) {
      additionalFilters.averageRating = { $gte: filterOptions.minRating };
    }

    if (filterOptions?.skillLevel) {
      additionalFilters['snapshot.skillLevel'] = filterOptions.skillLevel;
    }

    if (filterOptions?.language) {
      additionalFilters['snapshot.language'] = filterOptions.language;
    }

    if (filterOptions?.search) {
      additionalFilters.$text = { $search: filterOptions.search };
    }

    const combinedFilter = { ...filterQuery, ...additionalFilters };

    // Use buildMongooseQuery utility
    return buildMongooseQuery({
      model: this.courseModel,
      filterQuery: combinedFilter,
      sortOptions,
      paginationOptions,
      populateFields: [
        { path: 'instructor', select: 'lastName firstName email' },
        { path: 'category', select: 'name slug description icon color' },
      ],
      mapper: (doc) => this.map(doc),
    });
  }

  async findById(id: CourseEntity['id']): Promise<NullableType<CourseEntity>> {
    const doc = await this.courseModel
      .findById(id)
      .populate('instructor', 'lastName firstName email')
      .populate('category', 'name slug description icon color')
      .lean();
    return doc ? this.map(doc) : null;
  }

  /**
   * Find course by slug
   */
  async findBySlug(slug: string): Promise<NullableType<CourseEntity>> {
    const doc = await this.courseModel
      .findOne({ slug })
      .populate([
        { path: 'instructor', select: 'lastName firstName email' },
        { path: 'category', select: 'name slug description icon color' },
      ])
      .lean();

    if (!doc) {
      throw new NotFoundException('Course not found');
    }

    return this.map(doc);
  }

  async update(id: string, dto: UpdateCourseDto): Promise<CourseEntity | null> {
    // Get the existing course to check for category change
    const existingCourse = await this.courseModel.findById(id).lean();

    if (!existingCourse) {
      throw new NotFoundException('Course not found');
    }

    // Generate new slug if title is being updated
    if (dto.title && dto.title !== existingCourse.title) {
      const baseSlug = dto.slug || this.generateSlug(dto.title);
      dto.slug = await this.ensureUniqueSlug(baseSlug, id);
    } else if (dto.slug && dto.slug !== existingCourse.slug) {
      // Validate custom slug is unique
      dto.slug = await this.ensureUniqueSlug(dto.slug, id);
    }

    // Validate new category if provided
    if (dto.category && dto.category !== existingCourse.category) {
      try {
        const category = await this.categoriesService.findBySlug(dto.category);
        if (!category || !category.isActive) {
          throw new BadRequestException(
            `Category "${dto.category}" not found or is inactive`,
          );
        }
      } catch (error) {
        if (error instanceof NotFoundException) {
          throw new BadRequestException(
            `Category "${dto.category}" does not exist`,
          );
        }
        throw error;
      }

      // Decrement old category count and increment new category count
      try {
        if (existingCourse.category) {
          await this.categoriesService.decrementCourseCount(
            existingCourse.category,
          );
        }
        await this.categoriesService.incrementCourseCount(dto.category);
      } catch (error) {
        console.error('Failed to update category course counts:', error);
      }
    }

    const doc = await this.courseModel
      .findByIdAndUpdate(id, dto, { new: true })
      .populate('instructor', 'lastName firstName email')
      .lean();
    return doc ? this.map(doc) : null;
  }

  async remove(id: string): Promise<void> {
    // Get the course to decrement category count
    const course = await this.courseModel.findById(id).lean();

    if (course) {
      // Decrement category course count
      if (course.category) {
        try {
          await this.categoriesService.decrementCourseCount(course.category);
        } catch (error) {
          console.error('Failed to decrement category course count:', error);
        }
      }

      await this.courseModel.deleteOne({ _id: id });
    }
  }

  /**
   * Find courses by category
   */
  async findByCategory(
    categorySlug: string,
    paginationOptions: IPaginationOptions,
  ): Promise<PaginationResult<CourseEntity>> {
    // Verify category exists
    await this.categoriesService.findBySlug(categorySlug);

    const filterQuery = new FilterQueryBuilder<CourseSchemaClass>()
      .addEqual('category' as any, categorySlug)
      .addEqual('isPublished' as any, true)
      .build();

    return buildMongooseQuery({
      model: this.courseModel,
      filterQuery,
      sortOptions: [{ orderBy: 'createdAt', order: 'DESC' }],
      paginationOptions,
      populateFields: [
        { path: 'instructor', select: 'lastName firstName email' },
      ],
      mapper: (doc) => this.map(doc),
    });
  }

  /**
   * Find courses by subcategory
   */
  async findBySubcategory(
    subcategory: string,
    paginationOptions: IPaginationOptions,
  ): Promise<PaginationResult<CourseEntity>> {
    const filterQuery = {
      subcategories: subcategory,
      isPublished: true,
    };

    return buildMongooseQuery({
      model: this.courseModel,
      filterQuery,
      sortOptions: [{ orderBy: 'createdAt', order: 'DESC' }],
      paginationOptions,
      populateFields: [
        { path: 'instructor', select: 'lastName firstName email' },
      ],
      mapper: (doc) => this.map(doc),
    });
  }
}
