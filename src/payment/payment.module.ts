import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { Payment, PaymentSchema } from './schema/payment.schema';
import { StripeModule } from '../stripe/stripe.module';

import {
  EnrollmentSchemaClass,
  EnrollmentSchema,
} from '../Enrollment/infrastructure/enrollments.schema';
import { MailModule } from '../mail/mail.module';
import { PaymentController } from './payment.controller';
import { PaymentService } from './payment.service';
import {
  CourseSchema,
  CourseSchemaClass,
} from '../course/schema/course.schema';
import { UserSchema, UserSchemaClass } from '../users/schema/user.schema';
import { Booking, BookingSchema } from '../booking/schema/booking.schema';
import { ClassScheduleModule } from '../classSchedule/class-schedule.module';
import {
  Notification,
  NotificationSchema,
} from '../notification/schema/notification.schema';
import {
  BundleOffer,
  BundleOfferSchema,
} from '../bundle-offer/schema/bundle-offer.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Payment.name, schema: PaymentSchema },
      { name: CourseSchemaClass.name, schema: CourseSchema },
      { name: UserSchemaClass.name, schema: UserSchema },
      { name: EnrollmentSchemaClass.name, schema: EnrollmentSchema },
      { name: Booking.name, schema: BookingSchema },
      { name: Notification.name, schema: NotificationSchema },
      { name: BundleOffer.name, schema: BundleOfferSchema },
    ]),
    StripeModule,
    MailModule,
    ClassScheduleModule, // ✅ ClassScheduleHelperService use karne ke liye
  ],
  controllers: [PaymentController],
  providers: [PaymentService],
  exports: [PaymentService],
})
export class PaymentModule {}
