import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { AttendanceSchemaClass } from './schema/attendance.schema';
import { CourseSchemaClass } from '../course/schema/course.schema';
import { ClassScheduleSchemaClass } from '../classSchedule/schema/class-schedule.schema';
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
import { PassFailRecordSchemaClass } from './schema/pass-fail-record.schema';
import { PassFailRecordEntity } from './domain/pass-fail-record.entity';
import {
  ApprovePassFailDto,
  GetPassFailRecordsDto,
} from './dto/approve-pass-fail.dto';
import { PassFailStatusEnum } from './schema/pass-fail-record.schema';

@Injectable()
export class AttendanceService {
  constructor(
    @InjectModel(AttendanceSchemaClass.name)
    private readonly attendanceModel: Model<AttendanceSchemaClass>,
    @InjectModel(CourseSchemaClass.name)
    private readonly courseModel: Model<CourseSchemaClass>,
    @InjectModel(PassFailRecordSchemaClass.name)
    private readonly passFailRecordModel: Model<PassFailRecordSchemaClass>,
    @InjectModel(ClassScheduleSchemaClass.name)
    private readonly classScheduleModel: Model<ClassScheduleSchemaClass>,
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
      select: 'title slug sessions',
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
      //           If not populated, will be just the ID strings
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

    const find = new Types.ObjectId(dto.sessionId);

    console.log(find, 'find==>');

    const courseId = new Types.ObjectId(dto.courseId);

    const session = await this.courseModel
      .findById(courseId)
      .select('sessions')
      .lean();

    const sessionData = session.sessions.find(
      (s: any) => s._id?.toString() === dto.sessionId || s.id === dto.sessionId,
    );

    // Get ClassSchedule to check date and time, and update ClassLeftList
    const classSchedule = await this.classScheduleModel
      .findById(new Types.ObjectId(dto.classScheduleId))
      .lean();

    if (!classSchedule) {
      throw new NotFoundException('ClassSchedule not found');
    }

    // Initialize ClassLeftList if not exists
    const timeBlocksCount = sessionData?.timeBlocks?.length || 0;
    let classLeftList: boolean[] = classSchedule.ClassLeftList || [];
    if (classLeftList.length !== timeBlocksCount) {
      classLeftList = Array(timeBlocksCount).fill(false);
    }

    if (sessionData?.timeBlocks && Array.isArray(sessionData.timeBlocks)) {
      sessionData.timeBlocks.forEach((tb: any, index: number) => {
        const isDateMatch = dto.startDate === tb.startDate;
        const isTimeMatch = dto.startTime === tb.startTime;

        if (isDateMatch && isTimeMatch) {
          console.log(index, 'index==>');
          classLeftList[index] = true;
        }
      });
    }

    // Update ClassSchedule with ClassLeftList in database
    await this.classScheduleModel.findByIdAndUpdate(
      new Types.ObjectId(dto.classScheduleId),
      { ClassLeftList: classLeftList },
      { new: true }, // Return updated document
    );

    let createdCount = 0;
    let updatedCount = 0;
    const records: AttendanceEntity[] = [];
    const maxBlocksPerStudent = Math.max(timeBlocksCount, 1);

    // Process each student
    for (const studentAttendance of dto.students) {
      const studentId = new Types.ObjectId(studentAttendance.studentId);

      // Check if attendance already exists for same courseId, classScheduleId, sessionId, startDate, startTime, and student
      const existingAttendance = await this.attendanceModel
        .findOne({
          courseId: courseId,
          classScheduleId: new Types.ObjectId(dto.classScheduleId),
          sessionId: new Types.ObjectId(dto.sessionId),
          startDate: dto.startDate,
          startTime: dto.startTime,
          student: studentId,
        })
        .lean();

      if (existingAttendance) {
        // Skip creating duplicate attendance - already exists for this combination
        console.log(
          `Attendance already exists for student ${studentAttendance.studentId} with same courseId, classScheduleId, sessionId, date (${dto.startDate}), and time (${dto.startTime}). Skipping...`,
        );
        continue; // Skip this student and move to next
      }

      // Enforce per-student limit based on timeBlocks length
      const existingCount = await this.attendanceModel.countDocuments({
        classScheduleId: new Types.ObjectId(dto.classScheduleId),
        sessionId: new Types.ObjectId(dto.sessionId),
        student: studentId,
      });

      if (existingCount >= maxBlocksPerStudent) {
        throw new BadRequestException(
          `The attendance limit for this session has been reached. Please proceed with the assignment now `,
        );
      }

      // Create a new attendance record for this time block
      const created = await this.attendanceModel.create({
        classScheduleId: new Types.ObjectId(dto.classScheduleId),
        courseId: courseId,
        sessionId: new Types.ObjectId(dto.sessionId),
        student: studentId,
        markedBy: new Types.ObjectId(instructorId),
        status: studentAttendance.status,
        startDate: dto.startDate,
        startTime: dto.startTime,
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
      .addEqual(
        'sessionId' as any,
        filters?.sessionId ? new Types.ObjectId(filters.sessionId) : undefined,
      )
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
      .addEqual(
        'sessionId' as any,
        filterOptions?.sessionId
          ? new Types.ObjectId(filterOptions.sessionId)
          : undefined,
      )
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
      (s: any) => s._id?.toString() === sessionId || s.id === sessionId,
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
            Math.ceil(
              (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24),
            ) + 1;
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
   * Map PassFailRecord document to entity
   */
  private mapPassFailRecord(doc: any): PassFailRecordEntity {
    if (!doc) return undefined as any;

    const sanitized = sanitizeMongooseDocument(doc);
    if (!sanitized) return undefined as any;

    return {
      id: sanitized.id || convertIdToString(doc),
      studentId: sanitized.studentId,
      courseId: sanitized.courseId,
      sessionId: sanitized.sessionId,
      classScheduleId: sanitized.classScheduleId,
      status: sanitized.status,
      totalClasses: sanitized.totalClasses,
      presentCount: sanitized.presentCount,
      absentCount: sanitized.absentCount,
      attendancePercentage: sanitized.attendancePercentage,
      isApproved: sanitized.isApproved,
      approvedBy: sanitized.approvedBy,
      approvedAt: sanitized.approvedAt,
      certificateIssued: sanitized.certificateIssued,
      certificateId: sanitized.certificateId,
      certificateUrl: sanitized.certificateUrl,
      notes: sanitized.notes,
      determinedAt: sanitized.determinedAt,
      createdAt: sanitized.createdAt,
      updatedAt: sanitized.updatedAt,
    } as PassFailRecordEntity;
  }

  /**
   * Check Pass/Fail status for all students in a course session
   * Students with ZERO absences = PASS
   * Students with ANY absence = FAIL
   *
   * This function calculates pass/fail based on ALL attendance records for the course/session
   * and saves the results to the database for operator review.
   *
   * @param dto - CheckPassFailDto containing courseId, sessionId (classScheduleId is optional)
   * @returns PassFailSummary with all students' pass/fail results
   */
  async checkPassFailStatus(dto: CheckPassFailDto): Promise<PassFailSummary> {
    const { courseId, sessionId } = dto;

    // Get all attendance records for this course and session (across all class schedules)
    const query: any = {
      courseId: new Types.ObjectId(courseId),
      sessionId: new Types.ObjectId(sessionId),
    };

    const attendanceRecords = await this.attendanceModel
      .find(query)
      .populate('student', 'firstName lastName email')
      .lean();

    if (!attendanceRecords || attendanceRecords.length === 0) {
      throw new NotFoundException(
        'No attendance records found for this course and session',
      );
    }

    // Group attendance by student
    const studentAttendanceMap = new Map<string, any[]>();

    attendanceRecords.forEach((record: any) => {
      const studentId =
        record.student?._id?.toString() || record.student?.toString();
      if (!studentAttendanceMap.has(studentId)) {
        studentAttendanceMap.set(studentId, []);
      }
      studentAttendanceMap.get(studentId)?.push(record);
    });

    // Calculate pass/fail for each student and save to database
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
      const attendancePercentage =
        totalClasses > 0 ? Math.round((presentCount / totalClasses) * 100) : 0;

      // Determine pass/fail: PASS only if absentCount === 0
      const result =
        absentCount === 0 ? PassFailStatusEnum.PASS : PassFailStatusEnum.FAIL;

      if (result === PassFailStatusEnum.PASS) {
        passedCount++;
      } else {
        failedCount++;
      }

      const studentName =
        student.firstName && student.lastName
          ? `${student.firstName} ${student.lastName}`
          : student.email || 'Unknown Student';

      // Save or update pass/fail record in database
      const existingRecord = await this.passFailRecordModel.findOne({
        studentId: new Types.ObjectId(studentId),
        courseId: new Types.ObjectId(courseId),
        sessionId: new Types.ObjectId(sessionId),
      });

      const passFailData = {
        studentId: new Types.ObjectId(studentId),
        courseId: new Types.ObjectId(courseId),
        sessionId: new Types.ObjectId(sessionId),
        status: result,
        totalClasses,
        presentCount,
        absentCount,
        attendancePercentage,
        determinedAt: new Date(),
      };

      let savedRecord;
      if (existingRecord) {
        // Update existing record (preserve approval status if already approved)
        savedRecord = await this.passFailRecordModel
          .findByIdAndUpdate(
            existingRecord._id,
            {
              ...passFailData,
              // Don't overwrite approval if already approved
              isApproved: existingRecord.isApproved,
              approvedBy: existingRecord.approvedBy,
              approvedAt: existingRecord.approvedAt,
              // Don't overwrite certificate info if already issued
              certificateIssued: existingRecord.certificateIssued,
              certificateId: existingRecord.certificateId,
            },
            { new: true },
          )
          .lean();
      } else {
        // Create new record
        savedRecord = await this.passFailRecordModel.create(passFailData);
        savedRecord = await this.passFailRecordModel
          .findById(savedRecord._id)
          .lean();
      }

      // Get certificate issued status from saved record
      const certificateIssued = savedRecord?.certificateIssued || false;

      results.push({
        studentId,
        studentName,
        totalClasses,
        presentCount,
        absentCount,
        result: result as 'PASS' | 'FAIL',
        certificateIssued,
      });
    }

    // Sort results: PASS first, then FAIL
    results.sort((a, b) => {
      if (a.result === 'PASS' && b.result === 'FAIL') return -1;
      if (a.result === 'FAIL' && b.result === 'PASS') return 1;
      return 0;
    });

    return {
      classScheduleId: dto.classScheduleId || '',
      courseId,
      sessionId,
      totalStudents: studentAttendanceMap.size,
      passedStudents: passedCount,
      failedStudents: failedCount,
      results,
    };
  }

  /**
   * Get pass/fail records for a course session (for operator dashboard)
   * @param dto - GetPassFailRecordsDto with filters
   * @returns List of pass/fail records
   */
  async getPassFailRecords(
    dto: GetPassFailRecordsDto,
  ): Promise<PassFailRecordEntity[]> {
    const { courseId, sessionId, status, isApproved, certificateIssued } = dto;

    const query: any = {
      courseId: new Types.ObjectId(courseId),
      sessionId: new Types.ObjectId(sessionId),
    };

    if (status) {
      query.status = status;
    }

    if (isApproved !== undefined) {
      query.isApproved = isApproved;
    }

    if (certificateIssued !== undefined) {
      query.certificateIssued = certificateIssued;
    }

    const records = await this.passFailRecordModel
      .find(query)
      .populate('studentId', 'firstName lastName email')
      .populate('approvedBy', 'firstName lastName email')
      .sort({ status: 1, determinedAt: -1 })
      .lean();

    return records.map((doc) => this.mapPassFailRecord(doc));
  }

  /**
   * Approve or reject pass/fail status (operator action)
   * If approve=true, PASS status, and certificateUrl provided, certificate will be issued automatically
   * @param dto - ApprovePassFailDto with recordId, approve flag, and optional certificateUrl
   * @param operatorId - ID of the operator approving
   * @returns Updated pass/fail record
   */
  async approvePassFailStatus(
    dto: ApprovePassFailDto,
    operatorId: string,
  ): Promise<PassFailRecordEntity> {
    const { recordId, approve, notes, certificateUrl } = dto;

    const record = await this.passFailRecordModel.findById(recordId).lean();
    if (!record) {
      throw new NotFoundException('Pass/Fail record not found');
    }

    const updateData: any = {
      isApproved: approve,
    };

    if (approve) {
      updateData.approvedBy = new Types.ObjectId(operatorId);
      updateData.approvedAt = new Date();

      // If PASS status and certificateUrl provided, automatically issue certificate
      if (
        record.status === PassFailStatusEnum.PASS &&
        certificateUrl &&
        !record.certificateIssued
      ) {
        updateData.certificateIssued = true;
        updateData.certificateUrl = certificateUrl;
      }
    } else {
      // If rejecting, clear approval data
      updateData.approvedBy = null;
      updateData.approvedAt = null;
    }

    if (notes !== undefined) {
      updateData.notes = notes;
    }

    const updated = await this.passFailRecordModel
      .findByIdAndUpdate(recordId, updateData, { new: true })
      .populate('studentId', 'firstName lastName email')
      .populate('approvedBy', 'firstName lastName email')
      .lean();

    return this.mapPassFailRecord(updated);
  }

  /**
   * Get pass/fail record by ID
   * @param id - Pass/Fail record ID
   * @returns Pass/fail record
   */
  async getPassFailRecordById(
    id: string,
  ): Promise<PassFailRecordEntity | undefined> {
    const record = await this.passFailRecordModel
      .findById(id)
      .populate('studentId', 'firstName lastName email')
      .populate('approvedBy', 'firstName lastName email')
      .lean();

    return record ? this.mapPassFailRecord(record) : undefined;
  }

  /**
   * Get approved pass/fail records ready for certificate issuance
   * @param courseId - Course ID
   * @param sessionId - Session ID
   * @returns List of approved PASS records that haven't been issued certificates
   */
  async getApprovedPassRecordsForCertificates(
    courseId: string,
    sessionId: string,
  ): Promise<PassFailRecordEntity[]> {
    const records = await this.passFailRecordModel
      .find({
        courseId: new Types.ObjectId(courseId),
        sessionId: new Types.ObjectId(sessionId),
        status: PassFailStatusEnum.PASS,
        isApproved: true,
        certificateIssued: false,
      })
      .populate('studentId', 'firstName lastName email')
      .sort({ determinedAt: -1 })
      .lean();

    return records.map((doc) => this.mapPassFailRecord(doc));
  }

  /**
   * Mark certificate as issued for a pass/fail record
   * @param recordId - Pass/Fail record ID
   * @param certificateId - Certificate ID
   * @returns Updated pass/fail record
   */
  async markCertificateIssued(
    recordId: string,
    certificateId: string,
  ): Promise<PassFailRecordEntity> {
    // First check if record exists and is eligible
    const record = await this.passFailRecordModel.findById(recordId).lean();
    if (!record) {
      throw new NotFoundException('Pass/Fail record not found');
    }

    if (record.status !== PassFailStatusEnum.PASS) {
      throw new BadRequestException(
        'Only PASS records can have certificates issued',
      );
    }

    if (!record.isApproved) {
      throw new BadRequestException(
        'Record must be approved before certificate can be issued',
      );
    }

    if (record.certificateIssued) {
      throw new BadRequestException(
        'Certificate already issued for this record',
      );
    }

    const updated = await this.passFailRecordModel
      .findByIdAndUpdate(
        recordId,
        {
          certificateIssued: true,
          certificateId: new Types.ObjectId(certificateId),
        },
        { new: true },
      )
      .populate('studentId', 'firstName lastName email')
      .lean();

    return this.mapPassFailRecord(updated);
  }
}
