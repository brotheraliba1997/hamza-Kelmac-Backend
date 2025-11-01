import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ClassScheduleSchemaClass } from './infrastructure/persistence/document/entities/class-schedule.schema';

import { CreateClassScheduleDto } from './dto/create-class-schedule.dto';
import { UpdateClassScheduleDto } from './dto/update-class-schedule.dto';
import {
  FilterClassScheduleDto,
  SortClassScheduleDto,
} from './dto/query-class-schedule.dto';
import { randomUUID } from 'crypto';

@Injectable()
export class ClassScheduleService {
  constructor(
    @InjectModel(ClassScheduleSchemaClass.name)
    private readonly classScheduleModel: Model<ClassScheduleSchemaClass>,
  ) {}

  // 🟢 CREATE new class schedule
  async create(dto: CreateClassScheduleDto) {
    // Always assign a unique key to avoid duplicate key errors
    dto.securityKey = randomUUID();

    // Create class schedule
    const schedule = await this.classScheduleModel.create(dto);

    // Convert to plain JS object (important to prevent serialization issues)
    const plainSchedule = schedule.toObject();

    return {
      message: 'Class schedule created successfully',
      data: plainSchedule,
    };
  }

  // 📗 GET all schedules (with filters + sorting)
  async findAll(filters: FilterClassScheduleDto, sort?: SortClassScheduleDto) {
    const query: any = {};

    // 🔍 Apply filters dynamically
    if (filters.instructorId) query.instructor = filters.instructorId;
    if (filters.courseId) query.course = filters.courseId;
    if (filters.studentId) query.students = { $in: [filters.studentId] };
    if (filters.status) query.status = filters.status;

    if (filters.startDate || filters.endDate) {
      query.date = {};
      if (filters.startDate) query.date.$gte = filters.startDate;
      if (filters.endDate) query.date.$lte = filters.endDate;
    }

    if (filters.search) {
      query.$or = [
        { googleMeetLink: { $regex: filters.search, $options: 'i' } },
        { securityKey: { $regex: filters.search, $options: 'i' } },
      ];
    }

    // ⚙️ Apply sorting (default by creation date descending)
    const sortQuery: any = {};
    if (sort?.orderBy) {
      sortQuery[sort.orderBy] = sort?.order === 'ASC' ? 1 : -1;
    } else {
      sortQuery.createdAt = -1;
    }

    const schedules = await this.classScheduleModel
      .find(query)
      .sort(sortQuery)
      .populate('course')
      .populate('instructor')
      .populate('students');

    return {
      message: 'Class schedules fetched successfully',
      total: schedules.length,
      data: schedules,
    };
  }

  // 📘 GET one schedule by ID
  async findOne(id: string) {
    const schedule = await this.classScheduleModel
      .findById(id)
      .populate('course')
      .populate('instructor')
      .populate('students');

    if (!schedule) throw new NotFoundException('Class schedule not found');
    return { message: 'Class schedule found', data: schedule };
  }

  // 🟡 UPDATE schedule details
  async update(id: string, dto: UpdateClassScheduleDto) {
    const updated = await this.classScheduleModel.findByIdAndUpdate(id, dto, {
      new: true,
    });

    if (!updated) throw new NotFoundException('Class schedule not found');

    return {
      message: 'Class schedule updated successfully',
      data: updated,
    };
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
