import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Inject,
  Logger,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { ClassScheduleSchemaClass } from './schema/class-schedule.schema';

import { CreateClassScheduleDto } from './dto/create-class-schedule.dto';
import { UpdateClassScheduleDto } from './dto/update-class-schedule.dto';
import {
  FilterClassScheduleDto,
  SortClassScheduleDto,
} from './dto/query-class-schedule.dto';
import { randomUUID } from 'crypto';
import {
  buildMongooseQuery,
  FilterQueryBuilder,
  PaginationResult,
} from '../utils/mongoose-query-builder';
import { IPaginationOptions } from '../utils/types/pagination-options';
import { MailService } from '../mail/mail.service';
import { ConfigService } from '@nestjs/config';
import { AllConfigType } from '../config/config.type';
import { CourseSchemaClass } from '../course/schema/course.schema';
import { UserSchemaClass } from '../users/schema/user.schema';
import { google } from 'googleapis';
import {
  Notification,
  NotificationDocument,
} from '../notification/schema/notification.schema';
import {
  sanitizeMongooseDocument,
  convertIdToString,
} from '../utils/convert-id';
import { JwtPayloadType } from '../auth/strategies/types/jwt-payload.type';

@Injectable()
export class ClassScheduleService {
  private readonly logger = new Logger(ClassScheduleService.name);

  constructor(
    @InjectModel(ClassScheduleSchemaClass.name)
    private readonly classScheduleModel: Model<ClassScheduleSchemaClass>,

    @InjectModel(Notification.name)
    private readonly notificationModel: Model<NotificationDocument>,
    @InjectModel(CourseSchemaClass.name)
    private readonly courseModel: Model<CourseSchemaClass>,
    private readonly mailService: MailService,
    private readonly configService: ConfigService<AllConfigType>,
    @Inject('GOOGLE_OAUTH2_CLIENT') private oauth2Client,
  ) {}

  private map(doc: any) {
    if (!doc) return undefined;
    const id = typeof doc.id !== 'undefined' ? doc.id : doc._id?.toString?.();
    const sanitizedDoc = sanitizeMongooseDocument(doc);
    return {
      id,
      // course: sanitizedDoc.course,
      course: {
        ...sanitizedDoc.course,
        sessions: sanitizedDoc.course.sessions?.map((session: any) => ({
          ...session,
          instructor: session?.instructor?._doc
            ? session?.instructor?._doc
            : session.instructor,
        })),
      },
      sessionId: sanitizedDoc.sessionId,
      instructor: sanitizedDoc.instructor,
      students: sanitizedDoc.students,
      date: sanitizedDoc.date,
      time: sanitizedDoc.time,
      duration: sanitizedDoc.duration,
      googleMeetLink: sanitizedDoc.googleMeetLink,
      securityKey: sanitizedDoc.securityKey,
      status: sanitizedDoc.status,
      progress: sanitizedDoc.progress,
      startedAt: sanitizedDoc.startedAt,
      endedAt: sanitizedDoc.endedAt,
      isCompleted: sanitizedDoc.isCompleted,
      ClassLeftList: sanitizedDoc.ClassLeftList,
      googleCalendarEventLink: sanitizedDoc.googleCalendarEventLink,
      createdAt: sanitizedDoc.createdAt,
      updatedAt: sanitizedDoc.updatedAt,
      deletedAt: sanitizedDoc.deletedAt,
    };
  }

  async create(
    dto: CreateClassScheduleDto,
    accessToken: string,
    refreshToken: string,
  ) {
    const studentIds = Array.isArray(dto.students)
      ? dto.students
      : [dto.students];

    const duplicateSchedule = await this.classScheduleModel.findOne({
      course: new Types.ObjectId(dto.course),
      students: { $in: studentIds },
    });

    if (duplicateSchedule) {
      throw new BadRequestException('student already added in this schedule');
    }

    const schedules = await this.classScheduleModel.findOne({
      course: new Types.ObjectId(dto.course),
    });

    const studentId = Array.isArray(dto.students)
      ? dto.students[0]
      : dto.students;

    if (!studentId) {
      throw new BadRequestException('Student ID is required');
    }

    let schedule: any = null;

    if (schedules) {
      if (
        schedules.students.length > 0 &&
        schedules.students.some(
          (s) => s?.id?.toString() === studentId?.toString(),
        )
      ) {
        // Student already in schedule: return existing mapped scheduless
        return this.map(schedules.toObject());
      }

      schedules.students.push(new Types.ObjectId(studentId));

      await schedules.save();

      schedule = schedules;
    } else {
      schedule = await this.classScheduleModel.create({
        ...dto,
        course: new Types.ObjectId(dto?.course),
        students: [new Types.ObjectId(studentId)],
      });
    }

    // Check if notification already exists for same course + same students
    // const existingNotification = await this.notificationModel.findOne({
    //   receiverIds: { $in: studentIds },
    //   type: 'class_schedules',
    //   'meta.courseId': dto.course,
    // });

    // if (!existingNotification) {
    //   // Check if notification exists for same students but different course
    //   const notificationForDifferentCourse = await this.notificationModel.findOne({
    //     receiverIds: { $in: studentIds },
    //     type: 'class_schedules',
    //     'meta.courseId': { $ne: dto.course },
    //   });

    //   if (notificationForDifferentCourse) {
    //     // Update existing notification: add new courseId to meta and update receiverIds
    //     await this.notificationModel.updateOne(
    //       { _id: notificationForDifferentCourse._id },
    //       {
    //         $set: {
    //           receiverIds: studentIds,
    //           title: 'Class Schedule Created',
    //           message: 'A new class schedule has been created',
    //           meta: { courseId: dto.course },
    //         },
    //       },
    //     );
    //   } else {
    //     // Create new notification if none exists
    //     await this.notificationModel.create({
    //       receiverIds: studentIds,
    //       type: 'class_schedules',
    //       title: 'Class Schedule Created',
    //       message: 'A new class schedule has been created',
    //       meta: { courseId: dto.course },
    //     });
    //   }
    // }

    const alreadyExistsNotification = await this.notificationModel.findOne({
      receiverIds: { $in: studentIds },
      type: 'class_schedules',
      'meta.courseId': dto.course,
    });

    if (alreadyExistsNotification) {
      await this.notificationModel.updateOne(
        { _id: alreadyExistsNotification._id },
        {
          $addToSet: { receiverIds: { $each: studentIds } },
        },
      );
    } else {
      await this.notificationModel.create({
        receiverIds: studentIds,
        type: 'class_schedules',
        title: 'Class Schedule Created',
        message: 'A new class schedule has been created',
        meta: { courseId: dto.course },
      });
    }

    return this.map(schedule.toObject());
  }

  async findManyWithPagination({
    filterOptions,
    sortOptions,
    paginationOptions,
  }: {
    filterOptions?: FilterClassScheduleDto | null;
    sortOptions?: SortClassScheduleDto[] | null;
    paginationOptions: IPaginationOptions;
  }) {
    // Build filter query using FilterQueryBuilder
    console.log('Filter Options:', filterOptions);
    const filterQueryBuilder =
      new FilterQueryBuilder<ClassScheduleSchemaClass>()
        .addEqual('course' as any, filterOptions?.courseId)
        .addEqual('status' as any, filterOptions?.status);

    if (filterOptions?.studentId) {
      filterQueryBuilder.addCustom('students' as any, {
        $in: filterOptions?.studentId,
      });
    }

    if (filterOptions?.startDate || filterOptions?.endDate) {
      const dateFilter: any = {};
      if (filterOptions.startDate) dateFilter.$gte = filterOptions.startDate;
      if (filterOptions.endDate) dateFilter.$lte = filterOptions.endDate;
      filterQueryBuilder.addCustom('date' as any, dateFilter);
    }

    if (filterOptions?.search) {
      filterQueryBuilder.addCustom('$or' as any, [
        { googleMeetLink: { $regex: filterOptions.search, $options: 'i' } },
        { securityKey: { $regex: filterOptions.search, $options: 'i' } },
        { 'course.title': { $regex: filterOptions.search, $options: 'i' } },
      ]);
    }

    const filterQuery = filterQueryBuilder.build();

    // If instructor filter is provided, use direct query with populate
    if (filterOptions?.instructorId) {
      const instructorObjectId = new Types.ObjectId(filterOptions.instructorId);
      const page = paginationOptions.page || 1;
      const limit = paginationOptions.limit || 10;
      const skip = (page - 1) * limit;

      // First, get all class schedules that match base filters
      const allSchedules = await this.classScheduleModel
        .find(filterQuery)
        .populate({
          path: 'course',
          populate: {
            path: 'sessions',
            populate: {
              path: 'instructor',
              select: 'firstName lastName email',
            },
          },
        })
        .populate('students', 'firstName lastName email')
        .lean();

      // Filter in memory for instructor match in course.sessions
      const filteredSchedules = allSchedules.filter((schedule: any) => {
        if (!schedule.course?.sessions) return false;
        return schedule.course.sessions.some(
          (session: any) =>
            session.instructor?._id?.toString() ===
              instructorObjectId.toString() ||
            session.instructor?.toString() === instructorObjectId.toString(),
        );
      });

      console.log(
        `Total schedules: ${allSchedules.length}, Filtered: ${filteredSchedules.length}`,
      );

      // Apply pagination on filtered results
      const paginatedSchedules = filteredSchedules.slice(skip, skip + limit);
      const mappedResults = paginatedSchedules.map((doc) => this.map(doc));

      return {
        data: mappedResults,
        totalItems: filteredSchedules.length,
        limit,
        hasNextPage: skip + limit < filteredSchedules.length,
        hasPreviousPage: skip > 0,
        totalPages: Math.ceil(filteredSchedules.length / limit),
        currentPage: page,
      };
    }

    // For non-instructor filters, use standard query builder
    return buildMongooseQuery({
      model: this.classScheduleModel,
      filterQuery,
      sortOptions,
      paginationOptions,
      populateFields: [
        {
          path: 'course',
          populate: {
            path: 'sessions',
            populate: {
              path: 'instructor',
              select: 'firstName lastName email',
            },
          },
        },
        { path: 'students', select: 'firstName lastName email' },
      ],
      mapper: (doc) => this.map(doc),
    });
  }

  async findAll(userData?: any) {
    if (userData?.role === 1) {
      const schedules = await this.classScheduleModel
        // paginationOptions: { page: 1, limit: 1000 },
        .find({})
        .populate({
          path: 'course',
          populate: {
            path: 'sessions',
            populate: {
              path: 'instructor',
              select: 'firstName lastName email',
            },
          },
        })
        .populate('students', 'firstName lastName email')
        .lean();

      const mappedData = schedules.map((doc: any) => {
        const mapped = this.map(doc);
        if (mapped?.id) {
          mapped.id = convertIdToString(mapped) || mapped.id.toString();
        }
        return mapped;
      });

      return {
        message: 'Class schedules fetched successfully',
        total: schedules.length,
        data: mappedData,
      };
    }

    // NON-ADMIN → filtered data
    const schedules = await this.classScheduleModel
      .find({})
      .populate({ path: 'course' })
      .populate('students', 'firstName lastName email')
      .lean();

    const userId = userData?.id?.toString();

    const schedulesWithSession = schedules.filter((schedule: any) => {
      if (!schedule.course?.sessions || !userId) return false;

      return schedule.course.sessions.some((session: any) => {
        // Instructor match
        if (session.instructor?.toString() === userId) {
          return true;
        }

        // Student match
        return schedule.students?.some(
          (student: any) => student._id?.toString() === userId,
        );
      });
    });

    const mappedData = schedulesWithSession.map((schedule: any) => {
      const mapped = this.map(schedule);
      if (mapped?.id) {
        mapped.id = convertIdToString(mapped) || mapped.id.toString();
      }
      return mapped;
    });

    return {
      message: 'Class schedules fetched successfully',
      total: mappedData.length,
      data: mappedData,
    };
  }

  async findOne(id: string) {
    const schedule = await this.classScheduleModel
      .findById(id)
      .populate([
        { path: 'course' },
        { path: 'students', select: 'firstName lastName email' },
      ])
      .lean();

    if (!schedule) throw new NotFoundException('Class schedule not found');

    return this.map(schedule);
  }

  // 🟡 UPDATE schedule details
  async update(id: string, dto: UpdateClassScheduleDto) {
    const studentIds = Array.isArray(dto.students)
      ? dto.students
      : [dto.students];

    const duplicateSchedule = await this.classScheduleModel.findOne({
      course: new Types.ObjectId(dto.course),
      students: { $in: studentIds },
    });

    if (duplicateSchedule) {
      throw new BadRequestException('Schedule already exists for this student');
    }

    const updated = await this.classScheduleModel
      .findByIdAndUpdate(id, dto, { new: true })
      .populate([
        { path: 'course', select: 'title price' },

        { path: 'students', select: 'firstName lastName email' },
      ])
      .lean();

    if (!updated) throw new NotFoundException('Class schedule not founds');

    return this.map(updated);
  }

  async updateUserStatus(id: string, userId: string, status: string) {
    console.log(
      `Updating status for user ${userId} in schedule ${id} to ${status}`,
    );
    const schedule = await this.classScheduleModel
      .findOne({ course: new Types.ObjectId(id) })
      .lean();
    const updated = await this.classScheduleModel
      .findByIdAndUpdate(
        schedule._id,
        { $set: { 'students.$[elem].status': status } },
        {
          new: true,
          arrayFilters: [{ 'elem.id': userId }],
        },
      )
      .populate([
        { path: 'course', select: 'title price' },

        { path: 'students', select: 'firstName lastName email' },
      ])
      .lean();

    if (!updated) throw new NotFoundException('Class schedule not founds');

    return this.map(updated);
  }

  // 🔴 DELETE schedule
  async remove(id: string) {
    const deleted = await this.classScheduleModel.findByIdAndDelete(id);
    if (!deleted) throw new NotFoundException('Class schedule not found');

    return { message: 'Class schedule deleted successfully' };
  }

  // 🟢 JOIN CLASS via securityKey
  async joinClass(securityKey: string) {
    const schedule = await this.classScheduleModel
      .findOne({ securityKey })
      .populate('course');

    if (!schedule) throw new NotFoundException('Invalid security key');

    const now = new Date();
    const classDateTime = new Date(`${schedule.date}T${schedule.time}:00`);

    // 🕓 Validate class start time
    if (now < classDateTime) {
      throw new BadRequestException('Class has not started yet');
    }

    // Optionally mark status as ongoing
    if (schedule.status === 'scheduled') {
      schedule.status = 'ongoing';
      await schedule.save();
    }

    return {
      message: 'Class joined successfully',
      meetLink: schedule.googleMeetLink,
      data: {
        course: schedule.course,
        // instructor: schedule.instructor,
        date: schedule.date,
        time: schedule.time,
      },
    };
  }
}
