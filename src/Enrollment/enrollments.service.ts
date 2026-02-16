import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { CreateEnrollmentDto } from './dto/create-enrollment.dto';
import {
  Enrollment,
  EnrollmentDocument,
} from '../schema/Enrollment/enrollment.schema';

@Injectable()
export class EnrollmentsService {
  constructor(
    @InjectModel(Enrollment.name) private model: Model<EnrollmentDocument>,
  ) {}

  async create(dto: CreateEnrollmentDto): Promise<Enrollment> {
    return new this.model(dto).save();
  }

  async findAll() {
    return this.model.find().populate('user course').lean();
  }

  async findUserEnrollments(userId: string) {
    return this.model.find({ user: userId }).populate('course').lean();
  }

  async updateProgress(id: string, progress: number) {
    return this.model.findByIdAndUpdate(id, { progress }, { new: true }).lean();
  }
}
