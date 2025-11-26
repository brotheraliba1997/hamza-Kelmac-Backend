import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { AttendanceSchemaClass } from './schema/attendance.schema';
import { CourseSchemaClass } from '../course/schema/course.schema';
import { CreateAttendanceDto } from './dto/create-attendance.dto';
import { BulkMarkAttendanceDto } from './dto/bulk-mark-attendance.dto';
import { UpdateAttendanceDto } from './dto/update-attendance.dto';
import { FilterAttendanceDto } from './dto/query-attendance.dto';
import { AttendanceEntity } from './domain/attendance.entity';
import {
  buildMongooseQuery,
  FilterQueryBuilder,
  PaginationResult,
} from '../utils/mongoose-query-builder';
import { IPaginationOptions } from '../utils/types/pagination-options';
import {
  sanitizeMongooseDocument,
  convertIdToString,
} from '../utils/convert-id';
import {
  CheckPassFailDto,
  PassFailSummary,
  StudentPassFailResult,
} from './dto/check-pass-fail.dto';

@Injectable()
export class AttendanceService {
  constructor(
    @InjectModel(AttendanceSchemaClass.name)
    private readonly attendanceModel: Model<AttendanceSchemaClass>,
    @InjectModel(CourseSchemaClass.name)
    private readonly courseModel: Model<CourseSchemaClass>,
  ) {}

  private readonly attendancePopulate = [
    {
      path: 'classScheduleId',
      select: 'date time duration status course instructor',
      populate: [
        { path: 'course', select: 'title slug' },
        { path: 'instructor', select: 'firstName lastName email' },
      ],
    },
    {
      path: 'courseId',
      select: 'title slug sessions instructor',
      populate: [
        { path: 'instructor', select: 'firstName lastName email' },
      ],
    },
    { path: 'student', select: 'firstName lastName email' },
    { path: 'markedBy', select: 'firstName lastName email' },
  ];

  private map(doc: any): AttendanceEntity {
    if (!doc) return undefined as any;

    // Sanitize the document to convert all IDs and nested objects
    // sanitizeMongooseDocument automatically:
    // - Converts _id to id (as string)
    // - Handles populated references (converts nested _id to id)
    // - Preserves populated object structure (courseId, student, markedBy)
    const sanitized = sanitizeMongooseDocument(doc);
    if (!sanitized) return undefined as any;

    return {
      id: sanitized.id || convertIdToString(doc),
      // classScheduleId: Class Schedule ID reference
      classScheduleId: sanitized.classScheduleId,
      // courseId: If populated, will have { id, title, slug, sessions: [...], instructor: {...} }
      //           If not populated, will be just the ID string
      courseId: sanitized.courseId,
      // sessionId: Session ID from course.sessions array (stored in attendance document)
      sessionId: sanitized.sessionId,
      // student: If populated, will have { id, firstName, lastName, email }
      //          If not populated, will be just the ID string
      student: sanitized.student,
      // markedBy: If populated, will have { id, firstName, lastName, email }
      //           If not populated, will be just the ID string
      markedBy: sanitized.markedBy,
      status: sanitized.status,
      notes: sanitized.notes,
      markedAt: sanitized.markedAt,
      createdAt: sanitized.createdAt,
      updatedAt: sanitized.updatedAt,
    } as AttendanceEntity;
  }

  async create(
    dto: CreateAttendanceDto,
    instructorId: string,
  ): Promise<AttendanceEntity> {
    // Check if attendance already exists for this classScheduleId + student combination
    const existing = await this.attendanceModel
      .findOne({
        classScheduleId: new Types.ObjectId(dto.classScheduleId),
        student: new Types.ObjectId(dto.studentId),
      })
      .lean();

    if (existing) {
      // Update existing record instead of creating duplicate
      const updated = await this.attendanceModel
        .findByIdAndUpdate(
          existing._id,
          {
            classScheduleId: new Types.ObjectId(dto.classScheduleId),
            courseId: new Types.ObjectId(dto.courseId),
            sessionId: new Types.ObjectId(dto.sessionId),
            status: dto.status,
            notes: dto.notes,
            markedBy: new Types.ObjectId(instructorId),
            markedAt: new Date(),
          },
          { new: true },
        )
        .populate(this.attendancePopulate)
        .lean();

      return this.map(updated);
    }

    // Create new attendance record
    const created = await this.attendanceModel.create({
      classScheduleId: new Types.ObjectId(dto.classScheduleId),
      courseId: new Types.ObjectId(dto.courseId),
      sessionId: new Types.ObjectId(dto.sessionId),
      student: new Types.ObjectId(dto.studentId),
      markedBy: new Types.ObjectId(instructorId),
      status: dto.status,
      notes: dto.notes,
      markedAt: new Date(),
    });

    const populated = await this.attendanceModel
      .findById(created._id)
      .populate(this.attendancePopulate)
      .lean();

    return this.map(populated);
  }

  async bulkMark(
    dto: BulkMarkAttendanceDto,
    instructorId: string,
  ): Promise<{
    created: number;
    updated: number;
    total: number;
    records: AttendanceEntity[];
  }> {
    if (!dto.students || dto.students.length === 0) {
      throw new BadRequestException('No students provided for attendance');
    }

    const courseId = new Types.ObjectId(dto.courseId);
    let createdCount = 0;
    let updatedCount = 0;
    const records: AttendanceEntity[] = [];

    // Process each student
    for (const studentAttendance of dto.students) {
      const studentId = new Types.ObjectId(studentAttendance.studentId);

      // Check if attendance already exists
      const existing = await this.attendanceModel
        .findOne({
          classScheduleId: new Types.ObjectId(dto.classScheduleId),
          student: studentId,
        })
        .lean();

      if (existing) {
        // Update existing record
        const updated = await this.attendanceModel
          .findByIdAndUpdate(
            existing._id,
            {
              classScheduleId: new Types.ObjectId(dto.classScheduleId),
              courseId: courseId,
              sessionId: new Types.ObjectId(dto.sessionId),
              status: studentAttendance.status,
              markedBy: new Types.ObjectId(instructorId),
              markedAt: new Date(),
            },
            { new: true },
          )
          .populate(this.attendancePopulate)
          .lean();

        if (updated) {
          records.push(this.map(updated));
          updatedCount++;
        }
      } else {
        // Create new record
        const created = await this.attendanceModel.create({
          classScheduleId: new Types.ObjectId(dto.classScheduleId),
          courseId: courseId,
          sessionId: new Types.ObjectId(dto.sessionId),
          student: studentId,
          markedBy: new Types.ObjectId(instructorId),
          status: studentAttendance.status,
          markedAt: new Date(),
        });

        const populated = await this.attendanceModel
          .findById(created._id)
          .populate(this.attendancePopulate)
          .lean();

        if (populated) { 
          records.push(this.map(populated));
          createdCount++;
        }
      }
    }

    return {
      created: createdCount,
      updated: updatedCount,
      total: records.length,
      records,
    };
  }

  async findAll(filters?: FilterAttendanceDto): Promise<AttendanceEntity[]> {
    const filterQuery = new FilterQueryBuilder<AttendanceSchemaClass>()
      .addEqual('classScheduleId' as any, filters?.classScheduleId)
      .addEqual('courseId' as any, filters?.courseId)
      .addEqual('sessionId' as any, filters?.sessionId ? new Types.ObjectId(filters.sessionId) : undefined)
      .addEqual('student' as any, filters?.studentId)
      .addEqual('markedBy' as any, filters?.markedBy)
      .addEqual('status' as any, filters?.status)
      .build();

    const docs = await this.attendanceModel
      .find(filterQuery)
      .populate(this.attendancePopulate)
      .sort({ markedAt: -1 })
      .lean();

    return docs.map((doc) => this.map(doc));
  }

  async findManyWithPagination({
    filterOptions,
    sortOptions,
    paginationOptions,
  }: {
    filterOptions?: FilterAttendanceDto | null;
    sortOptions?: Array<{ orderBy?: string; order?: 'ASC' | 'DESC' }> | null;
    paginationOptions: IPaginationOptions;
  }): Promise<PaginationResult<AttendanceEntity>> {
    // Build filter query
    const filterQuery = new FilterQueryBuilder<AttendanceSchemaClass>()
      .addEqual('classScheduleId' as any, filterOptions?.classScheduleId)
      .addEqual('courseId' as any, filterOptions?.courseId)
      .addEqual('sessionId' as any, filterOptions?.sessionId ? new Types.ObjectId(filterOptions.sessionId) : undefined)
      .addEqual('student' as any, filterOptions?.studentId)
      .addEqual('markedBy' as any, filterOptions?.markedBy)
      .addEqual('status' as any, filterOptions?.status)
      .build();

    // Use buildMongooseQuery utility
    return buildMongooseQuery({
      model: this.attendanceModel,
      filterQuery,
      sortOptions,
      paginationOptions,
      populateFields: this.attendancePopulate,
      mapper: (doc) => this.map(doc),
    });
  }

  async findOne(id: string): Promise<AttendanceEntity | undefined> {
    const doc = await this.attendanceModel
      .findById(id)
      .populate(this.attendancePopulate)
      .lean();

    return doc ? this.map(doc) : undefined;
  }

  async update(
    id: string,
    dto: UpdateAttendanceDto,
  ): Promise<AttendanceEntity> {
    const updatePayload: any = {};

    if (dto.status !== undefined) {
      updatePayload.status = dto.status;
    }

    if (dto.notes !== undefined) {
      updatePayload.notes = dto.notes;
    }

    if (dto.classScheduleId) {
      updatePayload.classScheduleId = new Types.ObjectId(dto.classScheduleId);
    }

    if (dto.courseId) {
      updatePayload.courseId = new Types.ObjectId(dto.courseId);
    }

    if (dto.sessionId) {
      updatePayload.sessionId = new Types.ObjectId(dto.sessionId);
    }

    if (dto.studentId) {
      updatePayload.student = new Types.ObjectId(dto.studentId);
    }

    // Update markedAt timestamp when status or notes change
    if (dto.status !== undefined || dto.notes !== undefined) {
      updatePayload.markedAt = new Date();
    }

    const updated = await this.attendanceModel
      .findByIdAndUpdate(id, updatePayload, { new: true })
      .populate(this.attendancePopulate)
      .lean();

    if (!updated) {
      throw new NotFoundException('Attendance record not found');
    }

    return this.map(updated);
  }

  async remove(id: string): Promise<boolean> {
    const result = await this.attendanceModel.deleteOne({ _id: id });
    return (result as any).deletedCount > 0;
  }

  /**
   * Get attendance statistics for a student in a specific course session
   * @param courseId - Course ID
   * @param studentId - Student ID
   * @param sessionId - Session ID from course.sessions array
   * @returns Attendance statistics including total classes, attended, present, absent counts
   */
  async getAttendanceStats(
    courseId: string,
    studentId: string,
    sessionId: string,
  ): Promise<{
    courseId: string;
    sessionId: string;
    studentId: string;
    totalClasses: number;
    totalAttendanceRecords: number;
    presentCount: number;
    absentCount: number;
    attendancePercentage: number;
  }> {
    // Fetch course to get session details
    const course = await this.courseModel.findById(courseId).lean();
    if (!course) {
      throw new NotFoundException('Course not found');
    }

    // Find the specific session
    const session = course.sessions?.find(
      (s: any) =>
        s._id?.toString() === sessionId || s.id === sessionId,
    );

    if (!session) {
      throw new NotFoundException(
        `Session with ID ${sessionId} not found in course`,
      );
    }

    // Calculate total classes from session timeBlocks
    // Each timeBlock represents a date range, count individual classes
    let totalClasses = 0;
    if (session.timeBlocks && Array.isArray(session.timeBlocks)) {
      session.timeBlocks.forEach((block: any) => {
        if (block.startDate && block.endDate) {
          const start = new Date(block.startDate);
          const end = new Date(block.endDate);
          const daysDiff =
            Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) +
            1;
          totalClasses += daysDiff;
        }
      });
    }

    // Count attendance records for this student + course + session
    const totalAttendanceRecords = await this.attendanceModel.countDocuments({
      courseId: new Types.ObjectId(courseId),
      student: new Types.ObjectId(studentId),
      sessionId: new Types.ObjectId(sessionId),
    });

    // Count present attendance
    const presentCount = await this.attendanceModel.countDocuments({
      courseId: new Types.ObjectId(courseId),
      student: new Types.ObjectId(studentId),
      sessionId: new Types.ObjectId(sessionId),
      status: 'present',
    });

    // Count absent attendance
    const absentCount = await this.attendanceModel.countDocuments({
      courseId: new Types.ObjectId(courseId),
      student: new Types.ObjectId(studentId),
      sessionId: new Types.ObjectId(sessionId),
      status: 'absent',
    });

    // Calculate attendance percentage
    const attendancePercentage =
      totalClasses > 0 ? Math.round((presentCount / totalClasses) * 100) : 0;

    return {
      courseId,
      sessionId,
      studentId,
      totalClasses,
      totalAttendanceRecords,
      presentCount,
      absentCount,
      attendancePercentage,
    };
  }

  /**
   * Check Pass/Fail status for all students in a class schedule
   * Students with ZERO absences = PASS
   * Students with ANY absence = FAIL
   * 
   * @param dto - CheckPassFailDto containing classScheduleId, courseId, sessionId
   * @returns PassFailSummary with all students' pass/fail results
   */
  async checkPassFailStatus(
    dto: CheckPassFailDto,
  ): Promise<PassFailSummary> {
    const { classScheduleId, courseId, sessionId } = dto;

    // Get all unique students who have attendance records for this class schedule
    const attendanceRecords = await this.attendanceModel
      .find({
        classScheduleId: new Types.ObjectId(classScheduleId),
        courseId: new Types.ObjectId(courseId),
        sessionId: new Types.ObjectId(sessionId),
      })
      .populate('student', 'firstName lastName email')
      .lean();

    if (!attendanceRecords || attendanceRecords.length === 0) {
      throw new NotFoundException(
        'No attendance records found for this class schedule',
      );
    }

    // Group attendance by student
    const studentAttendanceMap = new Map<string, any[]>();
    
    attendanceRecords.forEach((record: any) => {
      const studentId = record.student?._id?.toString() || record.student?.toString();
      if (!studentAttendanceMap.has(studentId)) {
        studentAttendanceMap.set(studentId, []);
      }
      studentAttendanceMap.get(studentId)?.push(record);
    });

    // Calculate pass/fail for each student
    const results: StudentPassFailResult[] = [];
    let passedCount = 0;
    let failedCount = 0;

    for (const [studentId, records] of studentAttendanceMap.entries()) {
      const student = records[0].student;
      
      // Count present and absent
      const presentCount = records.filter(
        (r: any) => r.status === 'present',
      ).length;
      const absentCount = records.filter(
        (r: any) => r.status === 'absent',
      ).length;
      const totalClasses = records.length;

      // Determine pass/fail: PASS only if absentCount === 0
      const result = absentCount === 0 ? 'PASS' : 'FAIL';
      
      if (result === 'PASS') {
        passedCount++;
      } else {
        failedCount++;
      }

      const studentName = student.firstName && student.lastName
        ? `${student.firstName} ${student.lastName}`
        : student.email || 'Unknown Student';

      results.push({
        studentId,
        studentName,
        totalClasses,
        presentCount,
        absentCount,
        result,
        certificateIssued: false,
      });
    }

    // Sort results: PASS first, then FAIL
    results.sort((a, b) => {
      if (a.result === 'PASS' && b.result === 'FAIL') return -1;
      if (a.result === 'FAIL' && b.result === 'PASS') return 1;
      return 0;
    });

    return {
      classScheduleId,
      courseId,
      sessionId,
      totalStudents: studentAttendanceMap.size,
      passedStudents: passedCount,
      failedStudents: failedCount,
      results,
    };
  }
}

