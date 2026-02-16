import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { BundleOfferController } from './bundle-offer.controller';
import { BundleOfferService } from './bundle-offer.services';
import { BundleOffer, BundleOfferSchema } from './schema/bundle-offer.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: BundleOffer.name, schema: BundleOfferSchema },
    ]),
  ],
  controllers: [BundleOfferController],
  providers: [BundleOfferService],
  exports: [BundleOfferService],
})
export class BundleOfferModule {}
