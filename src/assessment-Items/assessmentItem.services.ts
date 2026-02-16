import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';

import { UpdateAssessmentItemDto } from './dto/update-assessment-item.dto';
import { CreateAssessmentItemDto } from './dto/create-assessment-Item.dto';
import { AssessmentItem } from './schema/assessmentItem.schema';
import {
  convertIdToString,
  sanitizeMongooseDocument,
} from '../utils/convert-id';
import {
  Notification,
  NotificationDocument,
} from '../notification/schema/notification.schema';

@Injectable()
export class AssessmentItemService {
  constructor(
    @InjectModel(AssessmentItem.name)
    private readonly assessmentItemModel: Model<AssessmentItem>,
    @InjectModel(Notification.name)
    private readonly notificationModel: Model<NotificationDocument>,
  ) {}

  private map(doc: any): any {
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

  // Create
  async create(dto: CreateAssessmentItemDto): Promise<AssessmentItem> {
    const item = new this.assessmentItemModel(dto);

    return item.save();
  }

  // Find allsss
  async findAll(): Promise<AssessmentItem[]> {
    return this.assessmentItemModel.find().exec();
  }

  async findByCourse(
    courseId: string,
    day: number,
  ): Promise<{ data: AssessmentItem[] }> {
    if (!courseId || !day)
      throw new BadRequestException('Course ID and day are required');

    const dayofCaptital = `Day ${day}`;

    const items = await this.assessmentItemModel
      .find({ courseId: new Types.ObjectId(courseId), day: dayofCaptital })
      .lean();

    if (!items || items.length === 0)
      throw new NotFoundException('Assessment items not founds');

    return {
      data: items.map((item) => this.map(item)),
    };
  }

  // Find by ID
  async findOne(id: string): Promise<AssessmentItem> {
    const item = await this.assessmentItemModel.findById(id).exec();
    if (!item) throw new NotFoundException('AssessmentItem not founds');
    return item;
  }

  // Find by Test ID
  async findByTest(testId: string): Promise<AssessmentItem[]> {
    return this.assessmentItemModel
      .find({ testId: new Types.ObjectId(testId) })
      .exec();
  }

  // Update
  async update(
    id: string,
    dto: UpdateAssessmentItemDto,
  ): Promise<AssessmentItem> {
    const updated = await this.assessmentItemModel
      .findByIdAndUpdate(id, dto, { new: true })
      .exec();
    if (!updated) throw new NotFoundException('AssessmentItem not found');
    return updated;
  }

  // Delete
  async remove(id: string): Promise<void> {
    const deleted = await this.assessmentItemModel.findByIdAndDelete(id).exec();
    if (!deleted) throw new NotFoundException('AssessmentItem not found');
  }
}
