import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { FeedbackAnswerSchemaClass } from './schema/feedback-answer.schema';
import { CreateFeedbackAnswerDto } from './dto/create-feedback-answer.dto';
import { UpdateFeedbackAnswerDto } from './dto/update-feedback-answer.dto';
import { ClassScheduleSchemaClass } from '../classSchedule/schema/class-schedule.schema';
import { sanitizeMongooseDocument } from '../utils/convert-id';
import { FeedbackQuestion } from '../feedback-Question/schema/feedback-question.schema';

@Injectable()
export class FeedbackAnswerService {
  constructor(
    @InjectModel(FeedbackAnswerSchemaClass.name)
    private readonly feedbackAnswerModel: Model<FeedbackAnswerSchemaClass>,
    @InjectModel(ClassScheduleSchemaClass.name)
    private readonly classScheduleModel: Model<ClassScheduleSchemaClass>,

    @InjectModel(FeedbackQuestion.name)
    private readonly feedbackQuestionModel: Model<FeedbackQuestion>,
  ) {}

  async create(dto: CreateFeedbackAnswerDto) {
    const { userId, answers } = dto;

    if (answers.length === 0)
      throw new BadRequestException('Answers are required');

    const answersArray = answers.map((answer: any) => {
      return {
        questionId: new Types.ObjectId(answer.questionId.toString()),
        answer: answer.answer,
        type: answer.type,
      };
    });

    const classSchedule = await this.classScheduleModel.findOne({
      students: { $in: [new Types.ObjectId(userId.toString())] },
    });

    if (!classSchedule)
      throw new NotFoundException(
        'Class schedule not found for this course and users',
      );

    const studentObject = classSchedule.students.find(
      (student: any) => student._id.toString() === userId,
    );

    let isClassFinished = false;
    const ClassLeftList = classSchedule.ClassLeftList.filter(
      (left: any) => left === false,
    );
    if (ClassLeftList.length > 0) {
      isClassFinished = false;
      return {
        success: false,
        message: 'Class is not finished yet',
      };
    } else {
      isClassFinished = true;
    }

    if (!studentObject) throw new NotFoundException('Student not found');

    const feedbackQuestion = await this.feedbackQuestionModel
      .find({
        courseId: classSchedule.course,
      })
      .lean();

    const studentId = studentObject._id.toString();

    let isCompleted = false;

    if (feedbackQuestion.length === 0) {
      isCompleted = true;
    }

    if (answersArray.length === feedbackQuestion.length) {
      isCompleted = true;
    }

    if (!isCompleted) {
      return {
        status: false,
        message: 'All Question is not answered yet',
      };
    }

    const feedbackAnswer = await this.feedbackAnswerModel.create({
      userId: new Types.ObjectId(studentId),
      courseId: new Types.ObjectId(classSchedule.course.toString()),
      answers: answersArray,
      isCompleted: isCompleted,
      isClassFinished: isClassFinished,
    });

    return {
      success: true,
      message: 'Feedback answer created successfully',
      data: this.map(feedbackAnswer.toObject()),
    };
  }

  async findAll() {
    const feedbackAnswers = await this.feedbackAnswerModel
      .find()
      .populate({ path: 'userId', select: 'firstName lastName email' })
      .populate({ path: 'courseId', select: 'title slug' })
      .populate({
        path: 'answers.questionId',
        select: 'question',
      });
    return {
      success: true,
      message: 'Feedback answers fetched successfully',
      data: feedbackAnswers.map((raw) => this.map(raw.toObject())),
    };
  }

  async findOne(id: string) {
    const feedbackAnswer = await this.feedbackAnswerModel.findById(id);
    if (!feedbackAnswer)
      throw new NotFoundException('Feedback answer not found');
    return this.map(feedbackAnswer) ?? null;
  }

  async update(id: string, dto: UpdateFeedbackAnswerDto) {
    const feedbackAnswer = await this.feedbackAnswerModel.findByIdAndUpdate(
      id,
      dto,
      { new: true },
    );
    if (!feedbackAnswer)
      throw new NotFoundException('Feedback answer not found');
    return this.map(feedbackAnswer) ?? null;
  }

  async remove(id: string) {
    const feedbackAnswer = await this.feedbackAnswerModel.findByIdAndDelete(id);
    if (!feedbackAnswer)
      throw new NotFoundException('Feedback answer not found');
    return this.map(feedbackAnswer) ?? null;
  }

  private map(raw: any) {
    if (!raw) return undefined as any;
    const sanitized = sanitizeMongooseDocument(raw) as any;
    return {
      id: sanitized?.id,
      userId: sanitized?.userId,
      courseId: sanitized?.courseId,
      answers: sanitized?.answers,
      isCompleted: sanitized?.isCompleted,
    };
  }
}
