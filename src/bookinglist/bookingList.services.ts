import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';

import { CreateBookingListDto } from './dto/create-booking.dto';
import { UpdateBookingDto } from './dto/update-booking.dto';
import { BookingList, BookingListDocument } from './schema/bookingList.schema';
import { sanitizeMongooseDocument } from '../utils/convert-id';
import {
  Notification,
  NotificationDocument,
} from '../notification/schema/notification.schema';
import { MailService } from '../mail/mail.service';

@Injectable()
export class BookingListService {
  private readonly logger = new Logger(BookingListService.name);

  constructor(
    @InjectModel(BookingList.name)
    private readonly bookingListModel: Model<BookingListDocument>,
    @InjectModel(Notification.name)
    private readonly notificationModel: Model<NotificationDocument>,
    private readonly mailService: MailService,
  ) {}

  private getUserFullName(
    user?: { firstName?: string; lastName?: string; email?: string } | null,
  ): string | undefined {
    if (!user) return undefined;
    const first = (user.firstName ?? '').trim();
    const last = (user.lastName ?? '').trim();
    const combined = `${first} ${last}`.trim();
    return combined || user.email || undefined;
  }

  private getCourseTitle(
    course?: { title?: string } | null,
  ): string | undefined {
    if (!course) return undefined;
    return typeof course === 'string' ? course : (course.title ?? undefined);
  }

  private map(doc: any) {
    if (!doc) return undefined;
    const sanitized = sanitizeMongooseDocument(doc);
    return {
      id: sanitized?.id || doc?._id?.toString?.(),
      ...sanitized,
    };
  }

  // async create(dto: CreateBookingListDto) {
  //   const studentIds = [...new Set(dto.studentIds)];
  //   const bookings = await Promise.all(
  //     studentIds.map(async (studentId) => {
  //       const existing = await this.bookingListModel.findOne({
  //         studentId: new Types.ObjectId(studentId),
  //         courseId: new Types.ObjectId(dto.courseId),
  //       });

  //       if (existing) {
  //         throw new BadRequestException(
  //           `Student ${studentId} has already booked this course`,
  //         );
  //       }

  //       const booking = await this.bookingListModel.create({
  //         studentId: new Types.ObjectId(studentId),
  //         courseId: new Types.ObjectId(dto.courseId),

  //         sessionId: new Types.ObjectId(dto.sessionId),
  //         paymentMethod: dto.paymentMethod ?? 'stripe',
  //         status: dto.status ?? 'pending',
  //         notes: dto.notes,
  //       });

  //       try {
  //         await this.notificationModel.create({
  //           receiverIds: [new Types.ObjectId(studentId)],
  //           type: 'Booking Created',
  //           title: 'Booking Created',
  //           message: 'Your course booking has been created successfully',
  //           meta: {
  //             bookingId: booking._id,
  //             courseId: dto.courseId,
  //           },
  //         });

  //         await booking.populate([
  //           { path: 'studentId', select: 'firstName lastName email' },
  //           { path: 'studentIds', select: 'firstName lastName email' },
  //           { path: 'courseId', select: 'title' },
  //         ]);

  //       return this.map(booking.toObject());
  //     }),
  //   );

  //   return { data: bookings, count: bookings.length };
  // }

  async findAll() {
    const bookings = await this.bookingListModel
      .find()
      .populate([
        { path: 'studentId', select: 'firstName lastName email' },
        { path: 'studentIds', select: 'firstName lastName email' },
        {
          path: 'courseId',
          select: 'title category sessions price discountedPrice',
        },
        {
          path: 'timeTableId',
          select: 'date time duration status',
        },
      ])
      .sort({ createdAt: -1 })
      .lean()
      .exec();

    return Array.isArray(bookings)
      ? bookings.map((b) => this.map(b))
      : this.map(bookings);
  }

  async findOne(id: string) {
    const booking = await this.bookingListModel
      .findById(id)
      .populate([
        { path: 'studentId', select: 'firstName lastName email' },
        { path: 'studentIds', select: 'firstName lastName email' },
        {
          path: 'courseId',
          select: 'title category sessions price discountedPrice',
        },
        {
          path: 'timeTableId',
          select: 'date time duration status',
        },
      ])
      .lean()
      .exec();

    if (!booking) {
      throw new NotFoundException(`Booking with id ${id} not found`);
    }

    return this.map(booking);
  }

  async update(id: string, dto: UpdateBookingDto) {
    const updateData: Record<string, any> = { ...dto };

    if (dto.studentIds?.length) {
      updateData.studentIds = dto.studentIds.map(
        (id) => new Types.ObjectId(id),
      );
      if (dto.studentIds.length === 1) {
        updateData.studentId = new Types.ObjectId(dto.studentIds[0]);
      } else {
        updateData.studentId = undefined; // multi-student booking
      }
    }

    if (dto.courseId) updateData.courseId = new Types.ObjectId(dto.courseId);

    if (dto.sessionId) updateData.sessionId = new Types.ObjectId(dto.sessionId);

    const updated = await this.bookingListModel
      .findByIdAndUpdate(id, updateData, { new: true })
      .populate([
        { path: 'studentId', select: 'firstName lastName email' },
        { path: 'studentIds', select: 'firstName lastName email' },
        { path: 'courseId', select: 'title' },
        { path: 'timeTableId', select: 'date time' },
      ])
      .lean()
      .exec();

    if (!updated) {
      throw new NotFoundException(`Booking with id ${id} not found`);
    }

    return this.map(updated);
  }

  async remove(id: string) {
    const deleted = await this.bookingListModel.findByIdAndDelete(id);

    if (!deleted) {
      throw new NotFoundException(`Booking with id ${id} not found`);
    }

    return { message: 'Booking deleted successfully' };
  }
}
