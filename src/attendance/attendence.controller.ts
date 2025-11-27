import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import {
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { CreateAttendanceDto } from './dto/create-attendance.dto';
import { BulkMarkAttendanceDto } from './dto/bulk-mark-attendance.dto';
import { UpdateAttendanceDto } from './dto/update-attendance.dto';
import { FilterAttendanceDto, SortAttendanceDto } from './dto/query-attendance.dto';
import { AttendanceStatusEnum } from './schema/attendance.schema';
import { AttendanceEntity } from './domain/attendance.entity';
import { AttendanceService } from './attendance.service';
import { CheckPassFailDto, PassFailSummary } from './dto/check-pass-fail.dto';

@ApiTags('Attendance')
@Controller({
  path: 'attendance',
  version: '1',
})
export class AttendanceController {
  constructor(private readonly attendanceService: AttendanceService) {}

  @ApiOperation({
    summary: 'Mark attendance for a single student',
    description: 'Instructor marks attendance for one student in a class schedule.',
  })
  @ApiCreatedResponse({
    description: 'Attendance marked successfully',
    type: AttendanceEntity,
  })
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() dto: CreateAttendanceDto) {
    // TODO: Get instructorId from authenticated user (auth guard) instead of DTO             
    // For now, instructorId comes from request body
    return await this.attendanceService.create(dto, dto.markedBy); 
  }

  @ApiOperation({
    summary: 'Bulk mark attendance for multiple students',
    description:
      'Instructor marks attendance for multiple students in a class schedule at once.',
  })
  @ApiCreatedResponse({
    description: 'Attendance marked for all students successfully',
    schema: {
      example: {
        message: 'Attendance marked for 5 students',
        created: 5,
        updated: 0,
      },
    },
  })
  @Post('bulk')
  @HttpCode(HttpStatus.CREATED)
  async bulkMark(@Body() dto: BulkMarkAttendanceDto) {
    // TODO: Get markedBy from authenticated user (auth guard) instead of DTO
    // For now, markedBy comes from request body
    return await this.attendanceService.bulkMark(dto, dto.markedBy);
  }

  @ApiOperation({
    summary: 'List attendance records',
    description:
      'Get all attendance records with optional filters (courseId, sessionId, student, markedBy, status).',
  })
  @ApiQuery({
    name: 'courseId',
    required: false,
    type: String,
    description: 'Filter by course ID',
  })
  @ApiQuery({
    name: 'sessionId',
    required: false,
    type: String,
    description: 'Filter by session ID from course.sessions array',
  })
  @ApiQuery({
    name: 'studentId',
    required: false,
    type: String,
    description: 'Filter by student ID',
  })
  @ApiQuery({
    name: 'markedBy',
    required: false,
    type: String,
    description: 'Filter by instructor who marked attendance',
  })
  @ApiQuery({
    name: 'status',
    required: false,
    enum: AttendanceStatusEnum,
    description: 'Filter by attendance status (present/absent)',
  })
  @ApiOkResponse({
    description: 'List of attendance records',
    type: [AttendanceEntity],
  })
  @Get()
  @HttpCode(HttpStatus.OK)
  async findAll(@Query() filters: FilterAttendanceDto) {
    return await this.attendanceService.findAll(filters);
  }

  @ApiOperation({
    summary: 'Get paginated attendance records',
    description:
      'Get attendance records with pagination, filters, and sorting options.',
  })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    description: 'Page number (default: 1)',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Items per page (default: 10, max: 50)',
  })
  @ApiQuery({
    name: 'courseId',
    required: false,
    type: String,
    description: 'Filter by course ID',
  })
  @ApiQuery({
    name: 'sessionId',
    required: false,
    type: String,
    description: 'Filter by session ID from course.sessions array',
  })
  @ApiQuery({
    name: 'studentId',
    required: false,
    type: String,
    description: 'Filter by student ID',
  })
  @ApiQuery({
    name: 'markedBy',
    required: false,
    type: String,
    description: 'Filter by instructor who marked attendance',
  })
  @ApiQuery({
    name: 'status',
    required: false,
    enum: AttendanceStatusEnum,
    description: 'Filter by attendance status',
  })
  @ApiOkResponse({
    description: 'Paginated attendance records',
  })
  @Get('paginated/list')
  @HttpCode(HttpStatus.OK)
  async findPaginated(@Query() query: any) {
    const page = query?.page ?? 1;
    let limit = query?.limit ?? 10;
    if (limit > 50) limit = 50;

    const filterOptions: FilterAttendanceDto = {
      courseId: query?.courseId,
      sessionId: query?.sessionId,
      studentId: query?.studentId,
      markedBy: query?.markedBy,
      status: query?.status,
    };

    return await this.attendanceService.findManyWithPagination({
      filterOptions,
      sortOptions: query?.sort,
      paginationOptions: {
        page: Number(page),
        limit: Number(limit),
      },
    });
  }

  @ApiOperation({
    summary: 'Get attendance statistics for a student',
    description:
      'Get attendance count and statistics for a student in a specific course session. Returns total classes, present/absent counts, and attendance percentage.',
  })
  @ApiQuery({
    name: 'courseId',
    required: true,
    type: String,
    description: 'Course ID',
  })
  @ApiQuery({
    name: 'studentId',
    required: true,
    type: String,
    description: 'Student ID',
  })
  @ApiQuery({
    name: 'sessionId',
    required: true,
    type: String,
    description: 'Session ID from course.sessions array',
  })
  @ApiOkResponse({
    description: 'Attendance statistics',
    schema: {
      example: {
        courseId: '675f4aaf2b67a23d4c9f2941',
        sessionId: '671018fabc123456789ef015',
        studentId: '675f4aaf2b67a23d4c9f2945',
        totalClasses: 20,
        totalAttendanceRecords: 18,
        presentCount: 15,
        absentCount: 3,
        attendancePercentage: 75,
      },
    },
  })
  @Get('stats')
  @HttpCode(HttpStatus.OK)
  async getAttendanceStats(
    @Query('courseId') courseId: string,
    @Query('studentId') studentId: string,
    @Query('sessionId') sessionId: string,
  ) {
    return await this.attendanceService.getAttendanceStats(
      courseId,
      studentId,
      sessionId,
    );
  }

  @ApiOperation({
    summary: 'Check Pass/Fail status for all students in a class',
    description:
      'Determines pass/fail status for all students in a class schedule. ' +
      'Students with ZERO absences = PASS. Students with ANY absence = FAIL. ' +
      'Returns summary with counts and individual student results.',
  })
  @ApiQuery({
    name: 'classScheduleId',
    required: true,
    type: String,
    description: 'Class Schedule ID',
  })
  @ApiQuery({
    name: 'courseId',
    required: true,
    type: String,
    description: 'Course ID',
  })
  @ApiQuery({
    name: 'sessionId',
    required: true,
    type: String,
    description: 'Session ID from course.sessions array',
  })
  @ApiOkResponse({
    description: 'Pass/Fail summary for all students',
    type: PassFailSummary,
    schema: {
      example: {
        classScheduleId: '675f4aaf2b67a23d4c9f2941',
        courseId: '675f4aaf2b67a23d4c9f2942',
        sessionId: '671018fabc123456789ef015',
        totalStudents: 25,
        passedStudents: 18,
        failedStudents: 7,
        results: [
          {
            studentId: '675f4aaf2b67a23d4c9f2945',
            studentName: 'Ali Khan',
            totalClasses: 20,
            presentCount: 20,
            absentCount: 0,
            result: 'PASS',
            certificateIssued: false,
          },
          {
            studentId: '675f4aaf2b67a23d4c9f2946',
            studentName: 'Sara Ahmed',
            totalClasses: 20,
            presentCount: 19,
            absentCount: 1,
            result: 'FAIL',
            certificateIssued: false,
          },
        ],
      },
    },
  })
  @Get('pass-fail-check')
  @HttpCode(HttpStatus.OK)
  async checkPassFail(@Query() query: CheckPassFailDto) {
    return await this.attendanceService.checkPassFailStatus(query);
  }

  @ApiOperation({
    summary: 'Get attendance record by ID',
    description: 'Fetch a single attendance record by its MongoDB ObjectId.',
  })
  @ApiParam({
    name: 'id',
    description: 'Attendance record MongoDB ObjectId',
    type: String,
  })
  @ApiOkResponse({
    description: 'Attendance record details',
    type: AttendanceEntity,
  })
  @Get(':id')
  @HttpCode(HttpStatus.OK)
  async findOne(@Param('id') id: string) {
    return await this.attendanceService.findOne(id);
  }

  @ApiOperation({
    summary: 'Update attendance record',
    description:
      'Update attendance status or notes. Typically used to correct mistakes or add notes.',
  })
  @ApiParam({
    name: 'id',
    description: 'Attendance record MongoDB ObjectId',
    type: String,
  })
  @ApiOkResponse({
    description: 'Attendance record updated successfully',
    type: AttendanceEntity,
  })
  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateAttendanceDto,
  ) {
    return await this.attendanceService.update(id, dto);
  }

  @ApiOperation({
    summary: 'Delete attendance record',
    description: 'Delete an attendance record by ID.',
  })
  @ApiParam({
    name: 'id',
    description: 'Attendance record MongoDB ObjectId',
    type: String,
  })
  @ApiOkResponse({
    description: 'Attendance record deleted',
    schema: {
      example: { deleted: true },
    },
  })
  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  async remove(@Param('id') id: string) {
    const deleted = await this.attendanceService.remove(id);
    return { deleted };
  }
}
