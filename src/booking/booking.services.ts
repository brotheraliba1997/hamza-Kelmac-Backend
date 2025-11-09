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

@Injectable()
export class BookingsService {
  private readonly logger = new Logger(BookingsService.name);

  constructor(
    @InjectModel(Booking.name) private bookingModel: Model<BookingDocument>,
    @InjectModel(Payment.name) private paymentModel: Model<PaymentDocument>,
  ) {}

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
        status: 'pending',
      });

      return newBooking.toObject();
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
    return this.bookingModel
      .find()
      .populate('studentId', 'name email')
      .populate('courseId', 'title category')
      .populate('timeTableId', 'date time')
      .populate('paymentId', 'amount currency status')
      .exec();
  }

  /**
   * ✅ Get single booking by ID
   */
  async findOne(id: string) {
    const booking = await this.bookingModel
      .findById(id)
      .populate('studentId', 'name email')
      .populate('courseId', 'title category')
      .populate('timeTableId', 'date time')
      .populate('paymentId', 'amount currency status')
      .exec();

    if (!booking)
      throw new NotFoundException(`Booking with id ${id} not found`);
    return booking;
  }

  /**
   * ✅ Update booking
   */
  async update(id: string, updateBookingDto: UpdateBookingDto) {
    const updated = await this.bookingModel
      .findByIdAndUpdate(id, updateBookingDto, { new: true })
      .populate('studentId', 'name email')
      .populate('courseId', 'title category')
      .populate('timeTableId', 'date time')
      .populate('paymentId', 'amount currency status')
      .exec();

    if (!updated)
      throw new NotFoundException(`Booking with id ${id} not found`);
    return updated;
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
