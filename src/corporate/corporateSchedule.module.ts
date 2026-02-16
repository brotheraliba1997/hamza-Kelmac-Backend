import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import {
  CourseSchema,
  CourseSchemaClass,
} from '../course/schema/course.schema';
import { UserSchema, UserSchemaClass } from '../users/schema/user.schema';
import { CorporateScheduleController } from './corporateSchedule.controller';
import { CorporateScheduleService } from './corporateSchedule.services';
import { MailModule } from '../mail/mail.module';
import { NotificationModule } from '../notification/notification.module';
import {
  Notification,
  NotificationSchema,
} from '../notification/schema/notification.schema';
import { UsersModule } from '../users/users.module';
import {
  BookingList,
  BookingListSchema,
} from '../bookinglist/schema/bookingList.schema';
import { Payment, PaymentSchema } from '../payment/schema/payment.schema';
import {
  PurchaseOrderSchema,
  PurchaseOrderSchemaClass,
} from '../purchaseOrder/schema/purchase.schema';
import { ClassScheduleModule } from '../classSchedule/class-schedule.module';

@Module({
  imports: [
    UsersModule,
    MailModule,
    NotificationModule,
    ClassScheduleModule,
    MongooseModule.forFeature([
      { name: CourseSchemaClass.name, schema: CourseSchema },
      { name: UserSchemaClass.name, schema: UserSchema },
      { name: BookingList.name, schema: BookingListSchema },
      { name: Payment.name, schema: PaymentSchema },
      { name: PurchaseOrderSchemaClass.name, schema: PurchaseOrderSchema },
      { name: Notification.name, schema: NotificationSchema },
    ]),
  ],
  controllers: [CorporateScheduleController],
  providers: [CorporateScheduleService],
  exports: [CorporateScheduleService, MongooseModule],
})
export class CorporateScheduleModule {}
