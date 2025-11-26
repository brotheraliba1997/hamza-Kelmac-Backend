import { BadRequestException } from '@nestjs/common';
import { Model, Types } from 'mongoose';
import { ClassScheduleSchemaClass } from '../../classSchedule/schema/class-schedule.schema';
import { CreateClassScheduleDto } from '../../classSchedule/dto/create-class-schedule.dto';

/**

 * 
 * @param classScheduleModel - Mongoose Model for ClassSchedule
 * @param courseId - Course ID
 * @param studentId - Student ID to add
 * @param scheduleData - Additional schedule data (optional)
 * @returns Created or updated schedule document
 */
export async function AddStudentToClassScheduleService(
  classScheduleModel: Model<ClassScheduleSchemaClass>,
  courseId: string,
  studentId: string,
  scheduleData?: Partial<CreateClassScheduleDto>,
) {
  const existingSchedule = await classScheduleModel.findOne({
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

    await existingSchedule.save();

    console.log(
      `✅ Student ${studentId} added to schedule ${existingSchedule._id}`,
    );
    schedule = existingSchedule;
  } else {
    // Schedule exist nahi karta - Naya banao

    schedule = await classScheduleModel.create({
      ...scheduleData,
      course: new Types.ObjectId(courseId),
      students: [studentId],
    });

    console.log(`✅ New schedule created with student ${studentId}`);
  }

  return schedule;
}
