import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { FeedbackQuestion } from './schema/feedback-question.schema';
import { CreateFeedbackDto } from './dto/create-feedback.dto';
import { UpdateFeedbackDto } from './dto/update-feedback.dto';

@Injectable()
export class FeedbackService {
  constructor(
    @InjectModel(FeedbackQuestion.name)
    private readonly feedbackModel: Model<FeedbackQuestion>,
  ) {}

  async create(dto: CreateFeedbackDto) {
    const questions = dto.questions.map((q) => ({
      courseId: dto.courseId ? new Types.ObjectId(dto.courseId) : null,
      title: q.title,
      question: q.question,
      options: q.options,
      type: q.type,
      status: q.status,
    }));
    const created = await this.feedbackModel.insertMany(questions);
    return created.map((doc) => this.map(doc));
  }

  async findAll() {
    const items = await this.feedbackModel
      .find()
      .populate('courseId', 'title slug')
      .lean();
    return items.map(this.map);
  }

  async findByCourseId(courseId: string) {
    const items = await this.feedbackModel
      .find({ courseId: new Types.ObjectId(courseId) })
      .populate('courseId', 'title slug')
      .lean();
    return items.map(this.map);
  }

  async findOne(id: string) {
    const item = await this.feedbackModel
      .findById(id)
      .populate('courseId', 'title slug')
      .lean();
    if (!item) {
      throw new NotFoundException(`Feedback question with id ${id} not found`);
    }
    return this.map(item);
  }

  async update(id: string, dto: UpdateFeedbackDto) {
    const item = await this.feedbackModel
      .findByIdAndUpdate(id, dto, { new: true })
      .populate('courseId', 'title slug')
      .lean();
    if (!item) {
      throw new NotFoundException(`Feedback question with id ${id} not found`);
    }
    return this.map(item);
  }

  async remove(id: string) {
    const item = await this.feedbackModel.findByIdAndDelete(id).lean();
    if (!item) {
      throw new NotFoundException(`Feedback question with id ${id} not found`);
    }
    return this.map(item);
  }

  private map(raw: any) {
    return {
      id: raw._id?.toString(),
      courseId: raw.courseId?.toString(),
      title: raw.title,
      question: raw.question,
      options: raw.options,
      type: raw.type,
      status: raw.status,
      createdAt: raw.createdAt,
      updatedAt: raw.updatedAt,
    };
  }
}
