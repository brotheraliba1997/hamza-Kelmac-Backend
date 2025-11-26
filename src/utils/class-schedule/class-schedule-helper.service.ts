import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { ClassScheduleSchemaClass } from '../../classSchedule/schema/class-schedule.schema';
import { CreateClassScheduleDto } from '../../classSchedule/dto/create-class-schedule.dto';

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
    const existingSchedule = await this.classScheduleModel.findOne({
      course: new Types.ObjectId(courseId),
    });

    let schedule: any = null;

    if (existingSchedule) {
      if (
        existingSchedule.students.length > 0 &&
        existingSchedule.students.some(
          (s) => s?.id?.toString() === studentId?.toString(),
        )
      ) {
        throw new BadRequestException(
          `Student ${studentId} is already added in schedule ${existingSchedule._id}`,
        );
      }

      existingSchedule.students.push({
        id: new Types.ObjectId(studentId),
        status: 'pending',
      });

      // if (existingSchedule.students.includes(studentId)) {
      //   throw new BadRequestException(
      //     `Student ${studentId} is already added in schedule ${existingSchedule._id}`,
      //   );
      // }

      // existingSchedule.students.push(studentId);

      await existingSchedule.save();

      this.logger.log(
        `✅ Student ${studentId} added to schedule ${existingSchedule._id}`,
      );
      schedule = existingSchedule;
    } else {
      schedule = await this.classScheduleModel.create({
        ...scheduleData,
        course: new Types.ObjectId(courseId),
        students: [studentId],
      });

      this.logger.log(`✅ New schedule created with student ${studentId}`);
    }

    return schedule;
  }
}
