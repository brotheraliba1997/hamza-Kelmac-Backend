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
import {
  PurchaseOrderSchema,
  PurchaseOrderSchemaClass,
} from '../purchaseOrder/schema/purchase.schema';
import {
  Notification,
  NotificationSchema,
} from '../notification/schema/notification.schema';
import { MailModule } from '../mail/mail.module';

@Module({
  imports: [
    MailModule,
    MongooseModule.forFeature([
      { name: Booking.name, schema: BookingSchema },
      { name: CourseSchemaClass.name, schema: CourseSchema },
      { name: UserSchemaClass.name, schema: UserSchema },
      { name: ClassScheduleSchemaClass.name, schema: ClassScheduleSchema },
      { name: Payment.name, schema: PaymentSchema },
      { name: PurchaseOrderSchemaClass.name, schema: PurchaseOrderSchema },
      { name: Notification.name, schema: NotificationSchema },
    ]),
  ],
  controllers: [BookingsController],
  providers: [BookingsService],
  exports: [
    BookingsService,
    MongooseModule, // ✅ Booking Model ko export karne ke liye
  ],
})
export class BookingsModule {}
