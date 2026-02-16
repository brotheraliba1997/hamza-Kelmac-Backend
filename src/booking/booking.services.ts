import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
// import { Booking } from './schemas/booking.schema';
import { CreateBookingDto } from './dto/create-booking.dto';
import { UpdateBookingDto } from './dto/update-booking.dto';
import { Booking, BookingDocument } from './schema/booking.schema';
import { Payment, PaymentDocument } from '../payment/schema/payment.schema';
import { sanitizeMongooseDocument } from '../utils/convert-id';
import {
  PurchaseOrderDocument,
  PurchaseOrderSchemaClass,
} from '../purchaseOrder/schema/purchase.schema';
import {
  Notification,
  NotificationDocument,
} from '../notification/schema/notification.schema';
import { MailService } from '../mail/mail.service';

@Injectable()
export class BookingsService {
  private readonly logger = new Logger(BookingsService.name);

  constructor(
    @InjectModel(Booking.name) private bookingModel: Model<BookingDocument>,
    @InjectModel(Payment.name) private paymentModel: Model<PaymentDocument>,
    @InjectModel(PurchaseOrderSchemaClass.name)
    private purchaseOrderModel: Model<PurchaseOrderDocument>,
    @InjectModel(Notification.name)
    private notificationModel: Model<NotificationDocument>,
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

  async map(doc: any): Promise<Booking> {
    if (!doc) return undefined as any;
    const sanitized = sanitizeMongooseDocument(doc);
    return {
      ...sanitized,
      courseId: {
        ...sanitized.courseId,
        sessions: sanitized.courseId.sessions?.map((session: any) => ({
          ...session,
          instructor: session?.instructor?._doc
            ? session?.instructor?._doc
            : session.instructor,
        })),
      },
    };
  }
  async create(createBookingDto: CreateBookingDto) {
    const payments = await this.paymentModel.findOne({
      userId: createBookingDto.studentId,
    });

    if (payments?.userId?.toString() === createBookingDto.studentId) {
      throw new BadRequestException(
        'Payment has already been used by this student',
      );
    }

    const booking = await this.bookingModel.findOne({
      studentId: new Types.ObjectId(createBookingDto.studentId),
    });

    console.log('Existing booking:', booking);

    if (booking?.studentId?.toString() === createBookingDto.studentId) {
      throw new BadRequestException(
        'already you have booked this course or same other course',
      );
    }

    try {
      const newBooking = await this.bookingModel.create({
        ...createBookingDto,
        studentId: new Types.ObjectId(createBookingDto.studentId),
        courseId: new Types.ObjectId(createBookingDto.courseId),
        timeTableId: new Types.ObjectId(createBookingDto.timeTableId),
        sessionId: new Types.ObjectId(createBookingDto.sessionId),
        paymentMethod: createBookingDto.paymentMethod || 'stripe',
        status: 'pending',
      });

      // Send notification to student
      try {
        await this.notificationModel.create({
          receiverIds: [new Types.ObjectId(createBookingDto.studentId)],
          type: 'Booking Created',
          title: 'Booking Created',
          message: 'Your course booking has been created successfully',
          meta: {
            bookingId: newBooking._id,
            courseId: createBookingDto.courseId,
          },
        });

        await newBooking.populate([
          { path: 'studentId', select: 'firstName lastName email' },
          { path: 'courseId', select: 'title' },
        ]);
        const student = newBooking.studentId as {
          firstName?: string;
          lastName?: string;
          email?: string;
        } | null;
        const course = newBooking.courseId as { title?: string } | null;
        const studentEmail = student?.email;
        if (studentEmail) {
          await this.mailService.bookingPending({
            to: studentEmail,
            data: {
              studentName: this.getUserFullName(student),
              courseTitle: this.getCourseTitle(course),
              paymentMethod: newBooking.paymentMethod ?? 'stripe',
              status: newBooking.status ?? 'pending',
            },
          });
        }
      } catch (notificationError) {
        this.logger.warn(
          'Failed to send booking notification',
          notificationError,
        );
        // Don't fail booking creation if notification fails
      }

      return this.map(newBooking.toObject());
    } catch (error) {
      this.logger.error('Failed to create booking', error.stack);
      console.log('Error details:', error);
      throw error;
    }
  }

  /**
   * ✅ Get all bookings with populated details
   */
  async findAll() {
    const bookings = await this.bookingModel
      .find()
      .populate([
        // { path: 'paymentId', select: 'amount currency status' },
        { path: 'studentId', select: 'name email' },
        { path: 'courseId', select: 'title category sessions' },
        { path: 'timeTableId', select: 'date time' },
      ])
      .lean()
      .exec();
    return this.map(bookings);
  }

  /**
   * ✅ Get single booking by ID
   */
  async findOne(id: string) {
    const booking = await this.bookingModel
      .findById(id)
      .populate([
        { path: 'studentId', select: 'firstName lastName email' },
        {
          path: 'courseId',
          select: 'title category sessions price discountedPrice sessions',
          populate: {
            path: 'sessions',
            populate: {
              path: 'instructor',
              select: 'firstName lastName email',
            },
          },
        },
        { path: 'timeTableId', select: 'startDate startTime endDate endTime' },
      ])
      .lean()
      .exec();

    if (!booking)
      throw new NotFoundException(`Booking with id ${id} not found`);
    return this.map(booking);
  }

  /**
   * ✅ Update booking
   */
  async update(id: string, updateBookingDto: UpdateBookingDto) {
    const updateData: any = { ...updateBookingDto };

    // Convert sessionId to ObjectId if provided
    if (updateBookingDto.sessionId) {
      updateData.sessionId = new Types.ObjectId(updateBookingDto.sessionId);
    }

    // Handle paymentMethod update
    if (updateBookingDto.paymentMethod) {
      updateData.paymentMethod = updateBookingDto.paymentMethod;
    }

    const updated = await this.bookingModel
      .findByIdAndUpdate(id, updateData, { new: true })
      .populate([
        // { path: 'paymentId', select: 'amount currency status' },
        { path: 'studentId', select: 'name email' },
        { path: 'courseId', select: 'title category sessions' },
        { path: 'timeTableId', select: 'date time' },
      ])
      .lean()
      .exec();

    if (!updated)
      throw new NotFoundException(`Booking with id ${id} not found`);
    return this.map(updated);
  }

  /**
   * ✅ Delete booking
   */
  async remove(id: string) {
    const deleted = await this.bookingModel.findByIdAndDelete(id);
    if (!deleted)
      throw new NotFoundException(`Booking with id ${id} not found`);
    return { message: 'Booking deleted successfully' };
  }
}
