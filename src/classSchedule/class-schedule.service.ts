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
      course: sanitizedDoc.course,
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
    // dto.securityKey = randomUUID();
    // this.oauth2Client.setCredentials({
    //   access_token: accessToken,
    //   refresh_token: refreshToken,
    // });

    // const calendar = google.calendar({
    //   version: 'v3',
    //   auth: this.oauth2Client,
    // });

    // const event = {
    //   summary: 'Scheduled Class',
    //   description: 'Auto-generated class schedule with Google Meet link',
    //   start: {
    //     dateTime: `${dto.date}T${dto.time}:00Z`, // e.g., "2025-11-04T15:00:00Z"
    //     timeZone: 'Asia/Karachi',
    //   },
    //   end: {
    //     dateTime: new Date(
    //       new Date(`${dto.date}T${dto.time}:00Z`).getTime() +
    //         dto.duration * 60000,
    //     ).toISOString(),
    //     timeZone: 'Asia/Karachi',
    //   },
    //   conferenceData: {
    //     createRequest: {
    //       requestId: randomUUID(),
    //       conferenceSolutionKey: { type: 'hangoutsMeet' },
    //     },
    //   },
    // };

    // const response = await calendar.events.insert({
    //   calendarId: 'primary',
    //   requestBody: event,
    //   conferenceDataVersion: 1,
    // });

    // dto.googleMeetLink =
    //   response.data.conferenceData?.entryPoints?.[0]?.uri || '';
    // dto.googleCalendarEventLink = response.data.htmlLink || '';

    const schedules = await this.classScheduleModel.findOne({
      course: new Types.ObjectId(dto.course),
    });

    const studentId = dto.students;

    let schedule: any = null;

    if (schedules) {
      if (
        schedules.students.length > 0 &&
        schedules.students.some(
          (s) => s?.id?.toString() === studentId?.toString(),
        )
      ) {
        throw new BadRequestException(
          `Student ${studentId} is already added in schedule ${schedules._id}`,
        );
      }

      schedules.students.push(new Types.ObjectId(studentId));

      await schedules.save();

      console.log(`✅ Student added to schedule ${schedules._id}`);
      schedule = schedules;
    } else {
      schedule = await this.classScheduleModel.create({
        ...dto,
        course: new Types.ObjectId(dto?.course),
        students: [{ id: new Types.ObjectId(studentId), status: 'pending' }],
      });
    }

    // const populatedSchedule = await this.classScheduleModel
    //   .findById(schedule._id)
    //   .populate([
    //     { path: 'course' },
    //     { path: 'instructor' },
    //     { path: 'students' },
    //   ])
    //   .lean();

    // if (populatedSchedule) {
    //   const course = populatedSchedule.course as any;
    //   const instructor = populatedSchedule.instructor as any;
    //   const students = populatedSchedule.students;

    //   const adminEmail = this.configService.get('app.adminEmail', {
    //     infer: true,
    //   });

    // const lessonDate = new Date(populatedSchedule.date).toLocaleDateString(
    //   'en-US',
    //   { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' },
    // );

    // const emailData = {
    //   courseName: course?.title || 'Unknown Course',
    //   instructorName: instructor?.firstName
    //     ? `${instructor.firstName} ${instructor.lastName || ''}`
    //     : instructor?.email || 'Unknown Instructor',
    //   lessonDate,
    //   // lessonTime: populatedSchedule.time,
    //   // duration: populatedSchedule.duration,
    //   // googleMeetLink: populatedSchedule.googleMeetLink,
    // };

    // try {
    //   if (adminEmail) {
    //     await this.mailService.lessonScheduled({
    //       to: adminEmail,
    //       data: emailData,
    //     });
    //   }
    //   if (instructor?.email) {
    //     await this.mailService.lessonScheduled({
    //       to: instructor.email,
    //       data: emailData,
    //     });
    //   }
    //   // for (const student of students) {
    //   //   if (student?.email) {
    //   //     await this.mailService.lessonScheduled({
    //   //       to: student.email,
    //   //       data: emailData,
    //   //     });
    //   //   }
    //   // }
    // } catch (error) {
    //   console.error('Failed to send lesson schedule emails:', error);
    // }
    // }

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
    const filterQueryBuilder =
      new FilterQueryBuilder<ClassScheduleSchemaClass>()
        .addEqual('instructor' as any, filterOptions?.instructorId)
        .addEqual('course' as any, filterOptions?.courseId)
        .addEqual('status' as any, filterOptions?.status);

    if (filterOptions?.studentId) {
      filterQueryBuilder.addCustom('students' as any, {
        $in: { id: filterOptions.studentId },
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
      ]);
    }

    const filterQuery = filterQueryBuilder.build();

    return buildMongooseQuery({
      model: this.classScheduleModel,
      filterQuery,
      sortOptions,
      paginationOptions,
      populateFields: [
        { path: 'course' },

        { path: 'students', select: 'firstName lastName email' },
      ],
      mapper: (doc) => this.map(doc),
    });
  }

  async findAll(userData?: any) {
    console.log(userData);

    if (userData?.id) {
      const schedules = await this.classScheduleModel
        .find({})
        .populate({
          path: 'course',
        })
        .populate('students', 'firstName lastName email')
        .lean();

      const schedulesWithSession = schedules.filter((schedule: any) => {
        let matchedSession = null;
        if (schedule.course?.sessions && schedule.sessionId) {
          matchedSession = schedule.course.sessions.find((s: any) => {
            if (s.instructor === userData?.id) {
              return s.instructor === userData?.id;
            } else {
              schedule.students.find((s: any) => {
                if (s.id === userData?.id) {
                  return s.id === userData?.id;
                }
              });
            }
          });
        }

        // Return true only if matchedSession is found
        return matchedSession !== null && matchedSession !== undefined;
      });

      // Map the filtered schedules
      const mappedData = schedulesWithSession.map((schedule: any) => {
        const mapped = this.map(schedule);
        if (mapped && mapped.id) {
          mapped.id =
            convertIdToString(mapped) || mapped.id?.toString() || mapped.id;
        }
        return mapped;
      });

      return {
        message: 'Class schedules fetched successfully',
        total: mappedData.length,
        data: mappedData,
      };
    } else {
      const schedules = await this.findManyWithPagination({
        paginationOptions: { page: 1, limit: 1000 },
      });

      const mappedData = schedules.data.map((doc: any) => {
        const mapped = this.map(doc);

        if (mapped && mapped.id) {
          mapped.id =
            convertIdToString(mapped) || mapped.id?.toString() || mapped.id;
        }
        return mapped;
      });

      return {
        message: 'Class schedules fetched successfully',
        total: schedules.totalItems,
        data: mappedData,
      };
    }
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
