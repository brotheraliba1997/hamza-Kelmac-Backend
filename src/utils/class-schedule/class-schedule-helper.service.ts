import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { ClassScheduleSchemaClass } from '../../classSchedule/schema/class-schedule.schema';
import { CreateClassScheduleDto } from '../../classSchedule/dto/create-class-schedule.dto';
import { CourseSchemaClass } from '../../course/schema/course.schema';

/**
 * 🔄 Class Schedule Helper Service
 * Injectable service - Kahi bhi inject kar ke use kar sakte ho
 */
@Injectable()
export class ClassScheduleHelperService {
  private readonly logger = new Logger(ClassScheduleHelperService.name);

  constructor(
    @InjectModel(ClassScheduleSchemaClass.name)
    private readonly classScheduleModel: Model<ClassScheduleSchemaClass>,
    @InjectModel(CourseSchemaClass.name)
    private readonly courseModel: Model<CourseSchemaClass>,
  ) {}

  /**
   * Add Student to Class Schedule
   * Schedule exist hai toh student add karo, nahi hai toh naya banao
   */
  async addStudentToSchedule(
    courseId: string,
    studentId: string,
    scheduleData?: Partial<CreateClassScheduleDto>,
  ) {
    console.log('courseId', courseId);
    const existingSchedule = await this.classScheduleModel.findOne({
      course: new Types.ObjectId(courseId),
    });

    let schedule: any = null;

    if (existingSchedule) {
      // Check if student already exists in schedule
      if (
        existingSchedule.students.length > 0 &&
        existingSchedule.students.some(
          (s) => s?.toString() === studentId?.toString(),
        )
      ) {
        throw new BadRequestException(
          `Student ${studentId} is already added in schedule ${existingSchedule._id}`,
        );
      }

      existingSchedule.students.push(new Types.ObjectId(studentId));
      await existingSchedule.save();

      this.logger.log(
        `✅ Student ${studentId} added to schedule ${existingSchedule._id}`,
      );
      schedule = existingSchedule;
    } else {
      // Initialize ClassLeftList based on session's timeBlocks
      let classLeftList: boolean[] = [];

      if (scheduleData?.sessionId) {
        try {
          const course = await this.courseModel.findById(courseId).lean();
          if (course && course.sessions) {
            for (const session of course?.sessions) {
              if (session && session.timeBlocks) {
                const timeBlocksCount = session.timeBlocks.length;
                console.log('timeBlocksCount', timeBlocksCount);
                classLeftList = Array(timeBlocksCount).fill(false);
                this.logger.log(
                  `📋 ClassLeftList initialized with ${timeBlocksCount} timeBlocks`,
                );
              }
            }
          }
        } catch (error) {
          this.logger.warn(
            `⚠️ Could not initialize ClassLeftList: ${error.message}`,
          );
        }
      }

      schedule = await this.classScheduleModel.create({
        ...scheduleData,
        course: new Types.ObjectId(courseId),
        students: [new Types.ObjectId(studentId)],
        ClassLeftList: classLeftList.length > 0 ? classLeftList : undefined,
        isCompleted: false,
      });

      this.logger.log(`✅ New schedule created with student ${studentId}`);
    }

    return schedule;
  }
}
