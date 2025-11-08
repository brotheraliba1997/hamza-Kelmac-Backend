import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Booking, BookingSchema } from './schema/booking.schema';

import {
  CourseSchema,
  CourseSchemaClass,
} from '../course/schema/course.schema';
import { UserSchema, UserSchemaClass } from '../users/schema/user.schema';
import {
  ClassScheduleSchema,
  ClassScheduleSchemaClass,
} from '../classSchedule/schema/class-schedule.schema';
import { Payment, PaymentSchema } from '../payment/schema/payment.schema';
import { BookingsController } from './booking.controller';
import { BookingsService } from './booking.services';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Booking.name, schema: BookingSchema },
      { name: CourseSchemaClass.name, schema: CourseSchema },
      { name: UserSchemaClass.name, schema: UserSchema },
      { name: ClassScheduleSchemaClass.name, schema: ClassScheduleSchema },
      { name: Payment.name, schema: PaymentSchema },
    ]),
  ],
  controllers: [BookingsController],
  providers: [BookingsService],
  exports: [BookingsService],
})
export class BookingsModule {}
