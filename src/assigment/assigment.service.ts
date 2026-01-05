import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';

import { IPaginationOptions } from '../utils/types/pagination-options';
import {
  sanitizeMongooseDocument,
  convertIdToString,
} from '../utils/convert-id';

import { AssignmentSchemaClass } from './schema/assigment.schema';
import getPdfLink from '../utils/pdf-download/pdfs';
import { AssigmentEntity } from './domain/assigment.entity';
import { CreateAssignmentDto } from './dto/create-assignment.dto';
import {
  buildMongooseQuery,
  FilterQueryBuilder,
  PaginationResult,
} from '../utils/mongoose-query-builder';
import { FilterAttendanceDto } from '../attendance/dto/query-attendance.dto';
import { UpdateAssignmentDto } from './dto/update-assignment.dto';
import {
  AssignmentCheckPassFailDto,
  PassFailStatusEnum,
} from './dto/assigment-check-pass-fail.dto';
import { AssignmentPassFailRecordEntity } from './domain/pass-fail-record.entity';
import { ApprovePassFailDto } from './dto/approve-pass-fail.dto';
import { AssigmentPassFailRecordSchemaClass } from './schema/pass-fail-record.schema';
import {
  CheckPassFailDto,
  PassFailSummary,
  StudentPassFailResult,
} from './dto/check-pass-fail.dto';

@Injectable()
export class AssignmentService {
  constructor(
    @InjectModel(AssignmentSchemaClass.name)
    private readonly assigmenteModel: Model<AssignmentSchemaClass>,
    @InjectModel(AssigmentPassFailRecordSchemaClass.name)
    private readonly passFailRecordModel: Model<AssigmentPassFailRecordSchemaClass>,
  ) {}

  private readonly assigmentePopulate = [
    {
      path: 'classScheduleId',
      select: 'date time duration status course',
      populate: [
        { path: 'course', select: 'title slug' },
        // { path: 'instructor', select: 'firstName lastName email' },
      ],
    },
    {
      path: 'courseId',
      select: 'title slug sessions',
    },
    { path: 'student', select: 'firstName lastName email' },
    { path: 'markedBy', select: 'firstName lastName email' },
  ];

  private map(doc: any): AssigmentEntity {
    if (!doc) return undefined as any;

    const sanitized = sanitizeMongooseDocument(doc);
    if (!sanitized) return undefined as any;

    return {
      id: sanitized.id,
      classScheduleId: sanitized.classScheduleId,
      courseId: sanitized.courseId,
      sessionId: sanitized.sessionId,
      student: sanitized.student,
      markedBy: sanitized.markedBy,
      marks: sanitized.marks,
      notes: sanitized.notes,
      certificateUrl: sanitized.certificateUrl,
      timeBlockIndex: sanitized.timeBlockIndex,
      createdAt: sanitized.createdAt,
      updatedAt: sanitized.updatedAt,
    };
  }

  private mapPassFailRecord(doc: any): AssignmentPassFailRecordEntity {
    if (!doc) return undefined as any;

    const sanitized = sanitizeMongooseDocument(doc);
    if (!sanitized) return undefined as any;

    return {
      id: sanitized.id || convertIdToString(doc),
      studentId: sanitized.studentId,
      courseId: sanitized.courseId,
      sessionId: sanitized.sessionId,
      classScheduleId: sanitized.classScheduleId,
      marks: sanitized.marks,
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
    } as AssignmentPassFailRecordEntity;
  }

  async create(
    dto: CreateAssignmentDto,

    instructorId: string,
  ): Promise<AssigmentEntity> {
    // Check if assigmente already exists for this classScheduleId + student combination

    const existing = await this.assigmenteModel
      .findOne({
        classScheduleId: new Types.ObjectId(dto.classScheduleId),
        student: new Types.ObjectId(dto.studentId),
      })
      .lean();

    if (existing) {
      // Update existing record instead of creating duplicate
      const updated = await this.assigmenteModel
        .findByIdAndUpdate(
          existing._id,
          {
            classScheduleId: new Types.ObjectId(dto.classScheduleId),
            courseId: new Types.ObjectId(dto.courseId),
            sessionId: new Types.ObjectId(dto.sessionId),
            marks: dto.marks,
            notes: dto.notes,
            markedBy: new Types.ObjectId(instructorId),
            markedAt: new Date(),
          },
          { new: true },
        )
        .populate(this.assigmentePopulate)
        .lean();

      return this.map(updated);
    }

    // Create new assigmente record
    const created = await this.assigmenteModel.create({
      classScheduleId: new Types.ObjectId(dto.classScheduleId),
      courseId: new Types.ObjectId(dto.courseId),
      sessionId: new Types.ObjectId(dto.sessionId),
      student: new Types.ObjectId(dto.studentId),
      markedBy: new Types.ObjectId(instructorId),
      marks: dto.marks,
      notes: dto.notes,
      markedAt: new Date(),
    });

    const populated = await this.assigmenteModel
      .findById(created._id)
      .populate(this.assigmentePopulate)
      .lean();

    return this.map(populated);
  }

  async findAll(filters?: FilterAttendanceDto): Promise<AssigmentEntity[]> {
    const filterQuery = new FilterQueryBuilder<AssignmentSchemaClass>()
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

    const docs = await this.assigmenteModel
      .find(filterQuery)
      .populate(this.assigmentePopulate)
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
  }): Promise<PaginationResult<AssigmentEntity>> {
    // Build filter query
    const filterQuery = new FilterQueryBuilder<AssignmentSchemaClass>()
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
      model: this.assigmenteModel,
      filterQuery,
      sortOptions,
      paginationOptions,
      populateFields: this.assigmentePopulate,
      mapper: (doc) => this.map(doc),
    });
  }

  async update(id: string, dto: UpdateAssignmentDto): Promise<AssigmentEntity> {
    const updatePayload: any = {};

    if (dto.marks !== undefined) {
      updatePayload.status = dto.marks;
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

    const updated = await this.assigmenteModel
      .findByIdAndUpdate(id, updatePayload, { new: true })
      .populate(this.assigmentePopulate)
      .lean();

    if (!updated) {
      throw new NotFoundException('Attendance record not found');
    }

    return this.map(updated);
  }

  async approvePassFailStatus(
    dto: ApprovePassFailDto,
    operatorId: string,
  ): Promise<AssignmentPassFailRecordEntity> {
    const { recordId, approve, notes, certificateUrl, pdfFileName } = dto;

    const record = await this.passFailRecordModel.findById(recordId).lean();
    if (!record) {
      throw new NotFoundException('Pass/Fail record not found');
    }

    // Generate certificate URL from PDF filename if provided
    let finalCertificateUrl = certificateUrl;
    if (pdfFileName && !certificateUrl) {
      finalCertificateUrl = getPdfLink(pdfFileName) || undefined;
    }

    console.log(finalCertificateUrl, 'finalCertificateUrl');

    const updateData: any = {
      isApproved: approve,
    };

    if (approve) {
      updateData.approvedBy = new Types.ObjectId(operatorId);
      updateData.approvedAt = new Date();

      // If PASS status and certificateUrl provided, automatically issue certificate
      //   if (
      //     record.status === PassFailStatusEnum.PASS &&
      //     finalCertificateUrl &&
      //     !record.certificateIssued
      //   ) {
      //     updateData.certificateIssued = true;
      //     updateData.certificateUrl = finalCertificateUrl;
      //   }
      // } else {
      //   // If rejecting, clear approval data
      //   updateData.approvedBy = null;
      //   updateData.approvedAt = null;
      // }

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
  }

  async checkPassFailStatus(dto: CheckPassFailDto): Promise<PassFailSummary> {
    const { courseId, sessionId } = dto;

    // Get all attendance records for this course and session (across all class schedules)
    const query: any = {
      courseId: new Types.ObjectId(courseId),
      sessionId: new Types.ObjectId(sessionId),
    };

    const assigmenteRecords = await this.assigmenteModel
      .find(query)
      .populate('student', 'firstName lastName email')
      .lean();

    if (!assigmenteRecords || assigmenteRecords.length === 0) {
      throw new NotFoundException(
        'No attendance records found for this course and session',
      );
    }

    // Group attendance by student
    const studentAttendanceMap = new Map<string, any[]>();

    assigmenteRecords.forEach((record: any) => {
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

      const totalClasses = records.length;

      // Count assignments with full marks (10) and without full marks
      const presentCount = records.filter((r: any) => r.marks === 10).length;
      const absentCount = records.filter((r: any) => r.marks !== 10).length;

      const maxMarks = totalClasses * 10;

      const obtainedMarks = records.reduce(
        (sum: number, r: any) => sum + (r.marks || 0),
        0,
      );

      const percentage =
        totalClasses > 0 ? Math.round((obtainedMarks / maxMarks) * 100) : 0;

      // Check if all assignments have full marks (10)
      const allFullMarks = records.every((r: any) => r.marks === 10);

      const result = allFullMarks
        ? PassFailStatusEnum.PASS
        : PassFailStatusEnum.FAIL;

      // const attendancePercentage = totalClasses > 0 ? Math.round((presentCount / totalClasses) * 100) : 0;

      // Determine pass/fail: PASS only if absentCount === 0
      // const result = absentCount === 0 ? PassFailStatusEnum.PASS : PassFailStatusEnum.FAIL;

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
        percentage,
        absentCount,
      
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
        savedRecord = await this.passFailRecordModel.create(passFailData);
        savedRecord = await this.passFailRecordModel
          .findById(savedRecord._id)
          .lean();
      }

      // Get certificate issued status from saved record
      const certificateIssued = savedRecord?.certificateIssued || false;

      results.push({
        id: savedRecord._id.toString(),
        studentId,
        studentName,
        totalClasses,
        presentCount,
        absentCount,
        percentage,
        

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
}
