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
import { CreateStudentItemGradeDto } from './dto/create-student-item-grade.dto';

@Injectable()
export class StudentItemGradeService {
  constructor(
    @InjectModel(StudentItemGrade.name)
    private readonly gradeModel: Model<StudentItemGrade>,
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

  /**
   * Create or Update (UPSERT)
   */
  async createOrUpdate(dto: CreateStudentItemGradeDto) {
    const { studentId, assessmentItemId, obtainedMarks } = dto;

    const existingGrade = await this.gradeModel.findOne({
      studentId: new Types.ObjectId(studentId),
      assessmentItemId: new Types.ObjectId(assessmentItemId),
    });

    if (existingGrade) {
      throw new BadRequestException('Grade already exists');
    }

    const createGrade = await this.gradeModel.findOneAndUpdate(
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
    );

    const grade = await this.gradeModel
      .findById(createGrade._id)
      .populate('studentId')
      .populate('assessmentItemId')
      .lean();
    return this.map(grade);
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
}
