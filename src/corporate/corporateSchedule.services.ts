import {
  BadRequestException,
  HttpStatus,
  Injectable,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import bcrypt from 'bcryptjs';

import {
  CreateCorporateScdeduleDto,
  PaymentMethod,
} from './dto/create-corporateSchedule';
import { CourseSchemaClass } from '../course/schema/course.schema';
import { UserSchemaClass } from '../users/schema/user.schema';
import {
  BookingList,
  BookingListDocument,
  BookingStatus,
} from '../bookinglist/schema/bookingList.schema';
import { Payment, PaymentDocument } from '../payment/schema/payment.schema';
import {
  PurchaseOrderSchemaClass,
  PurchaseOrderDocument,
} from '../purchaseOrder/schema/purchase.schema';
import { sanitizeMongooseDocument } from '../utils/convert-id';
import { RoleEnum } from '../roles/roles.enum';
import { StatusEnum } from '../statuses/statuses.enum';
import { ClassScheduleHelperService } from '../utils/class-schedule/class-schedule-helper.service';

@Injectable()
export class CorporateScheduleService {
  constructor(
    @InjectModel(CourseSchemaClass.name)
    private readonly courseModel: Model<CourseSchemaClass>,
    @InjectModel(UserSchemaClass.name)
    private readonly userModel: Model<UserSchemaClass>,

    @InjectModel(BookingList.name)
    private readonly bookingListModel: Model<BookingListDocument>,
    @InjectModel(Payment.name)
    private readonly paymentModel: Model<PaymentDocument>,
    @InjectModel(PurchaseOrderSchemaClass.name)
    private readonly purchaseOrderModel: Model<PurchaseOrderDocument>,
    private readonly classScheduleHelper: ClassScheduleHelperService,
  ) {}

  private readonly purchaseOrderPopulate = [
    { path: 'student', select: 'firstName lastName email' },
    { path: 'financialContact', select: 'firstName lastName email' },
    { path: 'course', select: 'title slug price currency sessions details' },
  ];

  private map(doc: any) {
    if (!doc) return undefined;

    // Convert Mongoose document to plain object first
    const sanitized = sanitizeMongooseDocument(doc.toObject?.() || doc);

    return {
      id: sanitized?.id || doc?._id?.toString?.(),
      ...sanitized,
    };
  }

  async create(dto: CreateCorporateScdeduleDto) {
    // Check for existing emails before creating any users
    for (const student of dto.students) {
      const existingUser = await this.userModel.findOne({
        email: student.email,
      });
      if (existingUser) {
        throw new UnprocessableEntityException({
          status: HttpStatus.UNPROCESSABLE_ENTITY,
          errors: {
            email: 'emailAlreadyExists',
          },
        });
      }
    }

    const students = await Promise.all(
      dto.students.map(async (s) => {
        const plainPassword = `${s.firstName}@1234`;
        const salt = await bcrypt.genSalt();
        const hashedPassword = await bcrypt.hash(plainPassword, salt);
        const user = await this.userModel.create({
          email: s.email,
          firstName: s.firstName,
          lastName: s.lastName,
          password: hashedPassword,
          role: {
            id: RoleEnum.student,
          },
          status: {
            id: StatusEnum.active,
          },
        });
        return user;
      }),
    );

    if (students.length === 0) {
      throw new BadRequestException('No students found');
    }

    const corporate = await this.userModel.findById(dto.corporateId);
    if (!corporate) {
      throw new NotFoundException('Corporate not found');
    }

    const booking = await this.bookingListModel.create({
      courseId: dto.courseId,
      sessionId: dto.sessionId,
      studentIds: students.map((s) => new Types.ObjectId(s._id.toString())),
      paymentMethod: dto.SelectedPaymentMethod ?? PaymentMethod.STRIPE,
      status: BookingStatus.CONFIRMED,
    });

    if (!booking) {
      return {
        statusCode: 400,
        message: 'Booking not found',
        error: 'Bad Reques',
      };
    }

    if (dto.SelectedPaymentMethod === PaymentMethod.STRIPE && dto.payment) {
      await this.paymentModel.create({
        courseId: new Types.ObjectId(dto.courseId),
        userId: new Types.ObjectId(dto.corporateId),
        amount: dto.payment.amount,
        currency: dto.payment.currency,
        paymentMethod: PaymentMethod.STRIPE,
      });

      const course = await this.courseModel.findById(
        new Types.ObjectId(dto.courseId),
      );
      for (const session of course?.sessions || []) {
        const sessionId = (session as any)?._id?.toString();
        if (sessionId !== dto.sessionId) continue;
        if (session.timeBlocks?.length) {
          const firstTimeBlock = session.timeBlocks[0];
          for (const student of students) {
            await this.classScheduleHelper.addStudentToSchedule(
              dto.courseId,
              student._id.toString(),
              {
                sessionId,
                instructor: session?.instructor,
                date: firstTimeBlock.startDate,
                time: firstTimeBlock.startTime,
                duration: 60,
              } as any,
            );
          }
        }
      }
    }

    if (
      dto.SelectedPaymentMethod === PaymentMethod.PURCHASEORDER &&
      dto.purchase
    ) {
      await this.purchaseOrderModel.create({
        course: new Types.ObjectId(dto.courseId),
        student: new Types.ObjectId(dto.corporateId),
        poNumber: dto.purchase.poNumber,
        BookingId: new Types.ObjectId(booking._id.toString()),
        financialContact: new Types.ObjectId(dto.purchase.financialContactId),
        bankSlipUrl: dto.purchase.bankSlipUrl,
        submittedAt: dto.purchase.submittedAt
          ? new Date(dto.purchase.submittedAt)
          : new Date(),
      });

      if (booking) {
        booking.status = BookingStatus.PENDING;
        await booking.save();
      }
    }

    return {
      statusCode: 201,
      message: 'Corporate schedule created successfully',
      data: this.map(booking),
    };
  }
}
