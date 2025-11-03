import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { Payment, PaymentSchema } from './schema/payment.schema';
import { StripeModule } from '../stripe/stripe.module';
import { Course, CourseSchema } from '../schema/Course/course.schema';
import { User, UserSchema } from '../schema/User/user.schema';
import {
  EnrollmentSchemaClass,
  EnrollmentSchema,
} from '../Enrollment/infrastructure/enrollments.schema';
import { MailModule } from '../mail/mail.module';
import { PaymentController } from './payment.controller';
import { PaymentService } from './payment.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Payment.name, schema: PaymentSchema },
      { name: Course.name, schema: CourseSchema },
      { name: User.name, schema: UserSchema },
      { name: EnrollmentSchemaClass.name, schema: EnrollmentSchema },
    ]),
    StripeModule,
    MailModule,
  ],
  controllers: [PaymentController],
  providers: [PaymentService],
  exports: [PaymentService],
})
export class PaymentModule {}
