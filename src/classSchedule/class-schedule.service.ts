import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Inject,
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
import { sanitizeMongooseDocument } from '../utils/convert-id';

@Injectable()
export class ClassScheduleService {
  constructor(
    @InjectModel(ClassScheduleSchemaClass.name)
    private readonly classScheduleModel: Model<ClassScheduleSchemaClass>,
    private readonly mailService: MailService,
    private readonly configService: ConfigService<AllConfigType>,
    @Inject('GOOGLE_OAUTH2_CLIENT') private oauth2Client,
  ) {}

  private map(doc: any) {
    if (!doc) return undefined;
    const id = typeof doc.id !== 'undefined' ? doc.id : doc._id?.toString?.();
    return {
      id,
      course: doc.course,
      instructor: doc.instructor,
      students: doc.students,
      date: doc.date,
      time: doc.time,
      duration: doc.duration,
      googleMeetLink: doc.googleMeetLink,
      securityKey: doc.securityKey,
      status: doc.status,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    };
  }

  async create(
    dto: CreateClassScheduleDto,
    accessToken: string,
    refreshToken: string,
  ) {
    dto.securityKey = randomUUID();

    this.oauth2Client.setCredentials({
      access_token: accessToken,
      refresh_token: refreshToken,
    });

    const calendar = google.calendar({
      version: 'v3',
      auth: this.oauth2Client,
    });

    const event = {
      summary: 'Scheduled Class',
      description: 'Auto-generated class schedule with Google Meet link',
      start: {
        dateTime: `${dto.date}T${dto.time}:00Z`, // e.g., "2025-11-04T15:00:00Z"
        timeZone: 'Asia/Karachi',
      },
      end: {
        dateTime: new Date(
          new Date(`${dto.date}T${dto.time}:00Z`).getTime() +
            dto.duration * 60000,
        ).toISOString(),
        timeZone: 'Asia/Karachi',
      },
      conferenceData: {
        createRequest: {
          requestId: randomUUID(),
          conferenceSolutionKey: { type: 'hangoutsMeet' },
        },
      },
    };

    const response = await calendar.events.insert({
      calendarId: 'primary',
      requestBody: event,
      conferenceDataVersion: 1,
    });

    dto.googleMeetLink =
      response.data.conferenceData?.entryPoints?.[0]?.uri || '';
    dto.googleCalendarEventLink = response.data.htmlLink || '';

    const schedules = await this.classScheduleModel.findOne({
      course: new Types.ObjectId(dto.course),
    });

    const studentId = dto.students;

    let schedule = null;

    if (schedules) {
      if (schedules.students.includes(studentId)) {
        throw new BadRequestException(
          `Student ${dto.students} is already added in schedule ${schedules._id}`,
        );
      }

      schedules.students.push(studentId);
      await schedules.save();

      console.log(`✅ Student added to schedule ${schedules._id}`);
      schedule = schedules;
    } else {
      schedule = await this.classScheduleModel.create({
        ...dto,
        course: new Types.ObjectId(dto?.course),
        students: [studentId],
      });
    }

    const populatedSchedule = await this.classScheduleModel
      .findById(schedule._id)
      .populate('course')
      .populate('instructor')
      .populate('students')
      .lean();

    if (populatedSchedule) {
      const course = populatedSchedule.course as any;
      const instructor = populatedSchedule.instructor as any;
      const students = populatedSchedule.students;

      const adminEmail = this.configService.get('app.adminEmail', {
        infer: true,
      });

      const lessonDate = new Date(populatedSchedule.date).toLocaleDateString(
        'en-US',
        { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' },
      );

      const emailData = {
        courseName: course?.title || 'Unknown Course',
        instructorName: instructor?.firstName
          ? `${instructor.firstName} ${instructor.lastName || ''}`
          : instructor?.email || 'Unknown Instructor',
        lessonDate,
        lessonTime: populatedSchedule.time,
        duration: populatedSchedule.duration,
        googleMeetLink: populatedSchedule.googleMeetLink,
      };

      try {
        if (adminEmail) {
          await this.mailService.lessonScheduled({
            to: adminEmail,
            data: emailData,
          });
        }
        if (instructor?.email) {
          await this.mailService.lessonScheduled({
            to: instructor.email,
            data: emailData,
          });
        }
        // for (const student of students) {
        //   if (student?.email) {
        //     await this.mailService.lessonScheduled({
        //       to: student.email,
        //       data: emailData,
        //     });
        //   }
        // }
      } catch (error) {
        console.error('Failed to send lesson schedule emails:', error);
      }
    }

    // 🔹 Step 8: Return mapped response
    return this.map(schedule);
  }

  // 📗 GET all schedules with pagination (with filters + sorting)
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
    const filterQueryBuilder =
      new FilterQueryBuilder<ClassScheduleSchemaClass>()
        .addEqual('instructor' as any, filterOptions?.instructorId)
        .addEqual('course' as any, filterOptions?.courseId)
        .addEqual('status' as any, filterOptions?.status);

    // Add student filter
    if (filterOptions?.studentId) {
      filterQueryBuilder.addCustom('students' as any, {
        $in: [filterOptions.studentId],
      });
    }

    // Add date range filter
    if (filterOptions?.startDate || filterOptions?.endDate) {
      const dateFilter: any = {};
      if (filterOptions.startDate) dateFilter.$gte = filterOptions.startDate;
      if (filterOptions.endDate) dateFilter.$lte = filterOptions.endDate;
      filterQueryBuilder.addCustom('date' as any, dateFilter);
    }

    // Add search filter
    if (filterOptions?.search) {
      filterQueryBuilder.addCustom('$or' as any, [
        { googleMeetLink: { $regex: filterOptions.search, $options: 'i' } },
        { securityKey: { $regex: filterOptions.search, $options: 'i' } },
      ]);
    }

    const filterQuery = filterQueryBuilder.build();

    // Use buildMongooseQuery utility
    return buildMongooseQuery({
      model: this.classScheduleModel,
      filterQuery,
      sortOptions,
      paginationOptions,
      populateFields: [
        { path: 'course', select: 'title price' },
        { path: 'instructor', select: 'firstName lastName email' },
        { path: 'students', select: 'firstName lastName email' },
      ],
      mapper: (doc) => this.map(doc),
    });
  }

  // Legacy method for backward compatibility
  async findAll(filters: FilterClassScheduleDto, sort?: SortClassScheduleDto) {
    const sortOptions = sort
      ? [sort]
      : [{ orderBy: 'createdAt', order: 'DESC' as 'DESC' }];

    const schedules = await this.findManyWithPagination({
      filterOptions: filters,
      sortOptions,
      paginationOptions: { page: 1, limit: 1000 }, // Large limit for "all"
    });

    return {
      message: 'Class schedules fetched successfully',
      total: schedules.totalItems,
      data: schedules.data,
    };
  }

  // 📘 GET one schedule by ID
  async findOne(id: string) {
    const schedule = await this.classScheduleModel
      .findById(id)
      .populate('course', 'title price')
      .populate('instructor', 'firstName lastName email')
      .populate('students', 'firstName lastName email')
      .lean();

    if (!schedule) throw new NotFoundException('Class schedule not found');
    const sanitized = sanitizeMongooseDocument(schedule);

    console.log(sanitized, 'sanitized');
    // const sanitized = sanitizeMongooseDocument(doc);

    if (!sanitized) return undefined as any;

    return {
      ...sanitized,
      id,
      course: sanitized.course,
      instructor: sanitized.instructor,
      students: sanitized.students,
      date: sanitized.date,
      time: sanitized.time,
      duration: sanitized.duration,
      googleMeetLink: sanitized.googleMeetLink,
      securityKey: sanitized.securityKey,
      status: sanitized.status,
      createdAt: sanitized.createdAt,
      updatedAt: sanitized.updatedAt,
    };
  }

  // 🟡 UPDATE schedule details
  async update(id: string, dto: UpdateClassScheduleDto) {
    const updated = await this.classScheduleModel
      .findByIdAndUpdate(id, dto, { new: true })
      .populate('course', 'title price')
      .populate('instructor', 'firstName lastName email')
      .populate('students', 'firstName lastName email')
      .lean();

    if (!updated) throw new NotFoundException('Class schedule not found');

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
      .populate('course')
      .populate('instructor');

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
        instructor: schedule.instructor,
        date: schedule.date,
        time: schedule.time,
      },
    };
  }
}
