import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Course, CourseDocument } from '../schema/Course/course.schema';
import { CreateCourseDto } from './dto/create-course.dto';
import { UpdateCourseDto } from './dto/update-course.dto';

@Injectable()
export class CoursesService {
  constructor(@InjectModel(Course.name) private model: Model<CourseDocument>) {}

  async create(dto: CreateCourseDto) {
    const created = await this.model.create({
      ...dto,
      instructor: new Types.ObjectId(dto.instructor), // ✅ ensure proper type
    });
    return created;
  }

  findAll() {
    return this.model.find().populate('instructor', 'name email').lean();
  }

  findOne(id: string | any) {
    // Agar id buffer ya object format me hai, to safely convert karlo
    const objectId =
      id instanceof Types.ObjectId
        ? id
        : Types.ObjectId.isValid(id)
          ? new Types.ObjectId(id)
          : null;

    if (!objectId) throw new Error('Invalid ID format');

    console.log('Converted ObjectId:', objectId);

    return this.model.findById(objectId).populate('instructor', 'name').lean();
  }

  update(id: string, dto: UpdateCourseDto) {
    return this.model.findByIdAndUpdate(id, dto, { new: true }).lean();
  }

  remove(id: string) {
    return this.model.findByIdAndDelete(id);
  }
}
