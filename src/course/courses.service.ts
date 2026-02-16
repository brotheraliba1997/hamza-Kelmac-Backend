import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
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
import { AssessmentItem } from '../assessment-Items/schema/assessmentItem.schema';
import { CreateCrouseAssessmentItemDto } from './dto/create-assessment-Item.dto';
import {
  Notification,
  NotificationDocument,
} from '../notification/schema/notification.schema';

type TimeBlockLike = {
  startDate?: string;
  endDate?: string;
  startTime?: string;
  endTime?: string;
};

type SessionLike = {
  timeBlocks?: TimeBlockLike[];
};

@Injectable()
export class CoursesService {
  constructor(
    @InjectModel(CourseSchemaClass.name)
    private readonly courseModel: Model<CourseSchemaClass>,
    private readonly mailService: MailService,
    private readonly configService: ConfigService<AllConfigType>,
    private readonly categoriesService: CategoriesService,

    @InjectModel(AssessmentItem.name)
    private readonly assessmentItemModel: Model<AssessmentItem>,

    @InjectModel(Notification.name)
    private readonly notificationModel: Model<NotificationDocument>,
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

  private convertTimeToMinutes(time?: string): number | null {
    if (!time) return null;
    const match = time.match(/^(\d{1,2}):([0-5][0-9])$/);
    if (!match) return null;
    const hours = Number(match[1]);
    const minutes = Number(match[2]);
    if (
      Number.isNaN(hours) ||
      Number.isNaN(minutes) ||
      hours < 0 ||
      hours > 23
    ) {
      return null;
    }
    return hours * 60 + minutes;
  }

  private calculateInclusiveDays(startDate?: string, endDate?: string): number {
    if (!startDate || !endDate) {
      return 1;
    }
    const start = new Date(startDate);
    const end = new Date(endDate);
    if (Number.isNaN(start.valueOf()) || Number.isNaN(end.valueOf())) {
      return 1;
    }
    const startMs = new Date(
      start.getFullYear(),
      start.getMonth(),
      start.getDate(),
    ).getTime();
    const endMs = new Date(
      end.getFullYear(),
      end.getMonth(),
      end.getDate(),
    ).getTime();

    if (endMs < startMs) {
      return 1;
    }

    const diffDays = Math.floor((endMs - startMs) / 86400000);
    return diffDays + 1;
  }

  private calculateTimeBlockMinutes(block?: TimeBlockLike): number {
    if (!block) {
      return 0;
    }
    const startMinutes = this.convertTimeToMinutes(block.startTime);
    const endMinutes = this.convertTimeToMinutes(block.endTime);

    if (startMinutes === null || endMinutes === null) {
      return 0;
    }

    let duration = endMinutes - startMinutes;
    if (duration <= 0) {
      duration += 24 * 60;
    }

    const days = this.calculateInclusiveDays(block.startDate, block.endDate);
    return duration * days;
  }

  private calculateTotalSessionMinutes(sessions?: SessionLike[]): number {
    if (!Array.isArray(sessions) || sessions.length === 0) {
      return 0;
    }

    return sessions.reduce((sessionSum, session) => {
      const blocks = Array.isArray(session?.timeBlocks)
        ? session.timeBlocks
        : [];
      const blockMinutes = blocks.reduce(
        (blockSum, block) => blockSum + this.calculateTimeBlockMinutes(block),
        0,
      );
      return sessionSum + blockMinutes;
    }, 0);
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
      // instructor: sanitized.instructor,
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

    if (dto.hasTest && (!dto.items || dto.items.length === 0)) {
      throw new BadRequestException('Assessment items are required');
    }

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

    // Create assessment items if provided
    if (dto.items && dto.items.length > 0) {
      try {
        const items = dto.items.map((item) => ({
          ...item,
          courseId: created._id, // Use ObjectId directly, not string
        }));

        await this.assessmentItemModel.insertMany(items);
        console.log(
          `✅ Created ${items.length} assessment items for course: ${created.title}`,
        );
      } catch (error) {
        console.error('Assessment items creation failed:', error);
        // Don't throw error - course is already created, just log the issue
      }
    }

    // Send notification and email to instructor
    let instructor: any = null;
    let emailData: any = null;

    const populatedCourse = await this.courseModel
      .findById(created._id)
      .populate('sessions.instructor')
      .lean();

    if (populatedCourse && populatedCourse.sessions?.length > 0) {
      instructor = populatedCourse.sessions[0].instructor as any;

      if (instructor) {
        emailData = {
          courseTitle: populatedCourse.title,
          instructorName: instructor?.firstName
            ? `${instructor.firstName} ${instructor.lastName || ''}`
            : instructor?.email || 'Unknown Instructor',
          description: populatedCourse.description,
          price: populatedCourse.price,
          courseUrl: `${this.configService.get('app.frontendDomain', { infer: true })}/courses/${created._id}`,
        };

        try {
          // Send email to instructor
          if (instructor?.email) {
            await this.mailService.courseCreated({
              to: instructor.email,
              data: emailData,
            });
          }
          if (instructor) {
            await this.notificationModel.create({
              receiverIds: [new Types.ObjectId(instructor?._id)],
              type: 'course_created',
              title: 'Course Created',
              message: 'A new course has been created',
              meta: { courseId: created._id },
            });
          }
        } catch (error) {
          console.error(
            'Failed to send course creation emails/notifications:',
            error,
          );
          // Don't throw error - course is already created
        }
      }
    }
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
      .addEqual(
        'category' as any,
        filterOptions?.category,
        // ? new Types.ObjectId(filterOptions.category)
        // : undefined,
      )
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
      // Use regex search for better compatibility
      const searchRegex = new RegExp(filterOptions.search, 'i');
      additionalFilters.$or = [
        { title: searchRegex },
        { description: searchRegex },
        { subcategories: searchRegex },
        { topics: searchRegex },
      ];
    }

    const combinedFilter = { ...filterQuery, ...additionalFilters };

    // Use buildMongooseQuery utility
    return buildMongooseQuery({
      model: this.courseModel,
      filterQuery: combinedFilter,
      sortOptions,
      paginationOptions,
      populateFields: [
        { path: 'sessions.instructor', select: 'lastName firstName email' },
        {
          path: 'sessions.location',
        },
        { path: 'category', select: 'name slug description icon color' },
      ],
      mapper: (doc) => this.map(doc),
    });
  }

  async findById(id: CourseEntity['id']): Promise<NullableType<CourseEntity>> {
    const doc = await this.courseModel
      .findById(id)
      .populate([
        { path: 'sessions.instructor', select: 'lastName firstName email' },
        {
          path: 'sessions.location',
        },
        { path: 'category', select: 'name slug description icon color' },
      ])
      .lean({ virtuals: false, getters: false });
    return doc ? this.map(doc) : null;
  }

  /**
   * Find course by slug
   */
  async findBySlug(slug: string): Promise<NullableType<CourseEntity>> {
    const doc = await this.courseModel
      .findOne({ slug })
      .populate([
        {
          path: 'sessions.instructor',
          select: 'lastName firstName email',
        },
        {
          path: 'sessions.location',
        },
        { path: 'category', select: 'name slug description icon color' },
        {
          path: 'timeTable',
        },
      ])
      .lean();

    if (!doc) {
      throw new NotFoundException('Course not found');
    }

    return this.map(doc);
  }

  async update(id: string, dto: UpdateCourseDto): Promise<CourseEntity | null> {
    const existingCourse = await this.courseModel.findById(id).lean();

    if (!existingCourse) {
      throw new NotFoundException('Course not found');
    }

    if (dto.title && dto.title !== existingCourse.title) {
      const baseSlug = dto.slug || this.generateSlug(dto.title);
      dto.slug = await this.ensureUniqueSlug(baseSlug, id);
    } else if (dto.slug && dto.slug !== existingCourse.slug) {
      // Validate custom slug is unique
      dto.slug = await this.ensureUniqueSlug(dto.slug, id);
    }

    if (
      dto.category &&
      (dto.category !== existingCourse?.category?.toString() ||
        dto.category !== existingCourse?.category?._id?.toString())
    ) {
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

      console.log(existingCourse, 'existingCourse');

      try {
        if (existingCourse.category) {
          await this.categoriesService.decrementCourseCount(
            existingCourse.category.toString(),
          );
        }
        await this.categoriesService.incrementCourseCount(dto.category);

        const populatedCourse = await this.courseModel
          .findById(id)
          .populate('sessions.instructor')
          .lean();

        let instructor = null;
        let emailData = null;

        if (populatedCourse && populatedCourse.sessions?.length > 0) {
          instructor = populatedCourse.sessions[0].instructor as any;

          if (instructor) {
            emailData = {
              courseTitle: populatedCourse.title,
              instructorName: instructor?.firstName
                ? `${instructor.firstName} ${instructor.lastName || ''}`
                : instructor?.email || 'Unknown Instructor',
              description: populatedCourse.description,
              price: populatedCourse.price,
              courseUrl: `${this.configService.get('app.frontendDomain', { infer: true })}/courses/${id}`,
            };

            try {
              // Send email to instructor
              if (instructor?.email) {
                await this.mailService.courseUpdated({
                  to: instructor.email,
                  data: emailData,
                });
              }
              if (instructor) {
                const instructorId = instructor._id || instructor.id;
                if (instructorId) {
                  await this.notificationModel.create({
                    receiverIds: [new Types.ObjectId(instructorId)],
                    type: 'course_updated',
                    title: 'Course Updated',
                    message: 'Your course has been updated',
                    meta: { courseId: id },
                  });
                }
              }
            } catch (error) {
              console.error(
                'Failed to send course update emails/notifications:',
                error,
              );
            }
          }
        }
      } catch (error) {
        console.error('Failed to update category course counts:', error);
      }
    }

    const doc = await this.courseModel
      .findByIdAndUpdate(id, dto, { new: true })
      .populate('sessions.instructor', 'lastName firstName email')
      .populate('sessions.location')
      .populate('category', 'name slug description icon color')
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
          await this.categoriesService.decrementCourseCount(
            course.category._id.toString(),
          );
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
        { path: 'category', select: 'name slug description icon color' },
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
        { path: 'category', select: 'name slug description icon color' },
      ],
      mapper: (doc) => this.map(doc),
    });
  }

  /**
   * Get courses grouped by category
   */
  async getCoursesByCategories() {
    // Fetch all featured categories
    const featuredCategories =
      await this.categoriesService.getFeaturedCategories();

    // Fetch all published courses
    const courses = await this.courseModel
      .find({ isPublished: true })
      .populate('category', 'name slug')
      .lean();

    // Create a map to group courses by category slug
    const categoriesMap: Record<string, any[]> = {};

    // Initialize arrays for each featured category
    for (const category of featuredCategories) {
      categoriesMap[category.slug] = [];
    }

    // Group courses by category
    for (const course of courses) {
      const category = course.category as any;
      const categorySlug = category?.slug || '';

      // Only include courses from featured categories
      if (categoriesMap[categorySlug] !== undefined) {
        // Count total session formats
        const totalSessions = course.sessions?.length || 0;

        // Calculate duration using time blocks
        const totalDurationMinutes = this.calculateTotalSessionMinutes(
          course.sessions as SessionLike[],
        );
        const totalHours =
          totalDurationMinutes > 0
            ? Math.max(1, Math.ceil(totalDurationMinutes / 60))
            : 0;

        const courseData = {
          href: `/course/${course.slug}`,
          title: course.title,
          hours: totalHours > 0 ? `${totalHours}+ Hours` : 'Flexible Schedule',
          lessons:
            totalSessions > 0 ? `${totalSessions} Sessions` : 'Schedule TBD',
          description: course.description || '',
        };

        categoriesMap[categorySlug].push(courseData);
      }
    }

    // Build response with category details
    const result: any = {};

    for (const category of featuredCategories) {
      const categoryKey = category.slug
        .split('-')
        .map((word, index) =>
          index === 0 ? word : word.charAt(0).toUpperCase() + word.slice(1),
        )
        .join('');

      result[categoryKey] = {
        categoryName: category.name,
        categorySlug: category.slug,
        categoryDescription: category.description,
        categoryIcon: category.icon,
        categoryColor: category.color,
        courses: categoriesMap[category.slug] || [],
      };
    }

    return result;
  }
}
