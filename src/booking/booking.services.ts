import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
// import { Booking } from './schemas/booking.schema';
import { CreateBookingDto } from './dto/create-booking.dto';
import { UpdateBookingDto } from './dto/update-booking.dto';
import { Booking, BookingDocument } from './schema/booking.schema';

@Injectable()
export class BookingsService {
  private readonly logger = new Logger(BookingsService.name);

  constructor(
    @InjectModel(Booking.name) private bookingModel: Model<BookingDocument>,
  ) {}

  /**
   * ✅ Create new booking
   * Automatically populates all references in the response.
   */
  async create(createBookingDto: CreateBookingDto) {
    try {
      const newBooking = await this.bookingModel.create({
        ...createBookingDto,
        studentId: new Types.ObjectId(createBookingDto.studentId),
        courseId: new Types.ObjectId(createBookingDto.courseId),
        timeTableId: new Types.ObjectId(createBookingDto.timeTableId),
        paymentId: new Types.ObjectId(createBookingDto.paymentId),
      });

      return await this.bookingModel
        .findById(newBooking._id)
        .populate('studentId', 'name email')
        .populate('courseId', 'title category')
        .populate('timeTableId', 'date time')
        .populate('paymentId', 'amount currency status')
        .exec();
    } catch (error) {
      this.logger.error('Failed to create booking', error.stack);
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

    if (!booking) throw new NotFoundException(`Booking with id ${id} not found`);
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

    if (!updated) throw new NotFoundException(`Booking with id ${id} not found`);
    return updated;
  }

  /**
   * ✅ Delete booking
   */
  async remove(id: string) {
    const deleted = await this.bookingModel.findByIdAndDelete(id);
    if (!deleted) throw new NotFoundException(`Booking with id ${id} not found`);
    return { message: 'Booking deleted successfully' };
  }
}
