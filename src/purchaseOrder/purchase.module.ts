import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import {
  PurchaseOrderSchema,
  PurchaseOrderSchemaClass,
} from './schema/purchase.schema';
import { PurchaseOrderService } from './purchase.services';
import { PurchaseOrderController } from './purchase.controller';
import { MailModule } from '../mail/mail.module';
import { PaymentModule } from '../payment/payment.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: PurchaseOrderSchemaClass.name,
        schema: PurchaseOrderSchema,
      },
    ]),
    MailModule,
    PaymentModule,
  ],
  controllers: [PurchaseOrderController],
  providers: [PurchaseOrderService],
  exports: [PurchaseOrderService],
})
export class PurchaseOrderModule {}

