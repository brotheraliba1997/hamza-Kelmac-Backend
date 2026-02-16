import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import {
  PurchaseOrderSchema,
  PurchaseOrderSchemaClass,
} from './schema/purchase.schema';
import {
  CourseSchemaClass,
  CourseSchema,
} from '../course/schema/course.schema';
import { PurchaseOrderService } from './purchase.services';
import { PurchaseOrderController } from './purchase.controller';
import { MailModule } from '../mail/mail.module';
import { PaymentModule } from '../payment/payment.module';
import { BookingsModule } from '../booking/booking.module';
import { ClassScheduleModule } from '../classSchedule/class-schedule.module';
import {
  Notification,
  NotificationSchema,
} from '../notification/schema/notification.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: PurchaseOrderSchemaClass.name,
        schema: PurchaseOrderSchema,
      },
      {
        name: CourseSchemaClass.name,
        schema: CourseSchema,
      },

      {
        name: Notification.name,
        schema: NotificationSchema,
      },
    ]),
    MailModule,
    PaymentModule,
    BookingsModule,
    ClassScheduleModule, // ✅ ClassScheduleHelperService use karne ke liye
  ],
  controllers: [PurchaseOrderController],
  providers: [PurchaseOrderService],
  exports: [PurchaseOrderService],
})
export class PurchaseOrderModule {}
