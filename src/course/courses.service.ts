import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Course, CourseDocument } from '../schema/Course/course.schema';
import { CreateCourseDto } from './dto/create-course.dto';
import { UpdateCourseDto } from './dto/update-course.dto';

@Injectable()
export class CoursesService {
  constructor(@InjectModel(Course.name) private model: Model<CourseDocument>) {}

  create(dto: CreateCourseDto) {
    return this.model.create(dto);
  }

  findAll() {
    return this.model.find().populate('instructor', 'name email').lean();
  }

  findOne(id: string) {
    return this.model.findById(id).populate('instructor', 'name').lean();
  }

  update(id: string, dto: UpdateCourseDto) {
    return this.model.findByIdAndUpdate(id, dto, { new: true }).lean();
  }

  remove(id: string) {
    return this.model.findByIdAndDelete(id);
  }
}
