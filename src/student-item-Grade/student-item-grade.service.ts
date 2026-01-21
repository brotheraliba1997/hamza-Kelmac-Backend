import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import {
  sanitizeMongooseDocument,
  convertIdToString,
} from '../utils/convert-id';
import { UpdateStudentItemGradeDto } from './dto/update-student-item-grade.dto';
import { StudentItemGrade } from './schema/student-item-grade.schema';
import {
  createManyStudentItemGradeDto,
  CreateStudentItemGradeDto,
} from './dto/create-student-item-grade.dto';
import { AssessmentItem } from '../assessment-Items/schema/assessmentItem.schema';

@Injectable()
export class StudentItemGradeService {
  constructor(
    @InjectModel(StudentItemGrade.name)
    private readonly gradeModel: Model<StudentItemGrade>,
    @InjectModel(AssessmentItem.name)
    private readonly assessmentItemModel: Model<AssessmentItem>,
  ) {}

  private map(doc: any): any {
    if (!doc) return undefined as any;

    const sanitized = sanitizeMongooseDocument(doc);
    if (!sanitized) return undefined as any;
    return {
      id: sanitized.id || convertIdToString(doc),
      studentId: sanitized.studentId,
      assessmentItemId: sanitized.assessmentItemId,
      obtainedMarks: sanitized.obtainedMarks,
      createdAt: sanitized.createdAt,
      updatedAt: sanitized.updatedAt,
    } as any;
  }

  private mapAssessmentItem(doc: any): any {
    if (!doc) return undefined as any;

    const sanitized = sanitizeMongooseDocument(doc);
    if (!sanitized) return undefined as any;
    return {
      id: sanitized.id || convertIdToString(doc),
      courseId: sanitized.courseId.toString(),
      day: sanitized.day,
      topicRef: sanitized.topicRef,
      title: sanitized.title,
      cu: sanitized.cu,
      maxMarks: sanitized.maxMarks,
      createdAt: sanitized.createdAt,
      updatedAt: sanitized.updatedAt,
    } as any;
  }

  async createOrUpdate(dto: createManyStudentItemGradeDto) {
    const results = [];

    for (const grade of dto.grades) {
      const { studentId, assessmentItemId, obtainedMarks } = grade;

      const record = await this.gradeModel
        .findOneAndUpdate(
          {
            studentId: new Types.ObjectId(studentId),
            assessmentItemId: new Types.ObjectId(assessmentItemId),
          },
          {
            obtainedMarks,
          },
          {
            upsert: true,
            new: true,
          },
        )
        .populate('studentId')
        .populate('assessmentItemId')
        .lean();

      results.push(this.map(record));
    }

    return results;
  }

  async findByStudent(studentId: string) {
    const grades = await this.gradeModel
      .find({ studentId: new Types.ObjectId(studentId) })
      .populate('studentId')
      .lean();
    return grades.map(this.map);
  }

  async update(id: string, dto: UpdateStudentItemGradeDto) {
    const updated = await this.gradeModel.findByIdAndUpdate(id, dto, {
      new: true,
    });

    if (!updated) {
      throw new NotFoundException('Student item grade not found');
    }

    const grade = await this.gradeModel
      .findById(updated._id)
      .populate('studentId')
      .populate('assessmentItemId')
      .lean();

    return this.map(grade);
  }

  async remove(id: string) {
    const deleted = await this.gradeModel.findByIdAndDelete(id);
    if (!deleted) {
      throw new NotFoundException('Student item grade not found');
    }
    return { message: 'Grade removed successfully' };
  }

  async resultPassFail(courseId: string, studentId: string) {
    const assessmentItems = await this.assessmentItemModel
      .find({
        courseId: new Types.ObjectId(courseId),
      })
      .lean();

    if (!assessmentItems || assessmentItems.length === 0) {
      throw new NotFoundException(
        'Assessment items not foundsss for thisss coursse',
      );
    }

    // Total max marks across all assessment items of this course
    const totalMaxMarks = assessmentItems.reduce(
      (acc: number, item: any) => acc + (item.maxMarks || 0),
      0,
    );

    if (totalMaxMarks === 0) {
      throw new BadRequestException('Total max marks is zero');
    }

    const grades = await this.gradeModel
      .find({
        studentId: new Types.ObjectId(studentId),
        assessmentItemId: {
          $in: assessmentItems.map((item: any) => item._id),
        },
      })
      .lean();

    if (!grades || grades.length === 0) {
      throw new NotFoundException('Grades not found for this student');
    }

    const studentMarks = grades.reduce(
      (sum: number, grade: any) => sum + (grade.obtainedMarks || 0),
      0,
    );

    const passFailStatus = Number(
      ((studentMarks / totalMaxMarks) * 100).toFixed(2),
    );
    if (passFailStatus >= 70) {
      return {
        message: 'Pass',
        result: `${passFailStatus}%`,
        totalQuestionMarks: totalMaxMarks,
        studentMarks: studentMarks,
      };
    } else {
      return {
        message: 'Fail',
        result: `${passFailStatus}%`,
        totalQuestionMarks: totalMaxMarks,
        studentMarks: studentMarks,
      };
    }
  }
}
