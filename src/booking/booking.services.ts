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

@Injectable()
export class BookingsService {
  private readonly logger = new Logger(BookingsService.name);

  constructor(
    @InjectModel(Booking.name) private bookingModel: Model<BookingDocument>,
    @InjectModel(Payment.name) private paymentModel: Model<PaymentDocument>,
  ) {}
  async map(doc: any): Promise<Booking> {
    if (!doc) return undefined as any;
    const sanitized = sanitizeMongooseDocument(doc);
    return sanitized;
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
        SessionId: new Types.ObjectId(createBookingDto.SessionId),
        paymentMethod: createBookingDto.paymentMethod || 'stripe',
        status: 'pending',
      });

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
        { path: 'paymentId', select: 'amount currency status' },
        { path: 'studentId', select: 'name email' },
        { path: 'courseId', select: 'title category sessions' },
        { path: 'timeTableId', select: 'date time' },
      ])
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
        { path: 'paymentId', select: 'amount currency status' },
        { path: 'studentId', select: 'name email' },
        { path: 'courseId', select: 'title category sessions' },
        { path: 'timeTableId', select: 'date time' },
      ])
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
    
    // Convert SessionId to ObjectId if provided
    if (updateBookingDto.SessionId) {
      updateData.SessionId = new Types.ObjectId(updateBookingDto.SessionId);
    }

    // Handle paymentMethod update
    if (updateBookingDto.paymentMethod) {
      updateData.paymentMethod = updateBookingDto.paymentMethod;
    }

    const updated = await this.bookingModel
      .findByIdAndUpdate(id, updateData, { new: true })
      .populate([
        { path: 'paymentId', select: 'amount currency status' },
        { path: 'studentId', select: 'name email' },
        { path: 'courseId', select: 'title category sessions' },
        { path: 'timeTableId', select: 'date time' },
      ])
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
