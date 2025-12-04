import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { LocationSeedService } from './location-seed.service';
import {
  LocationSchemaClass,
  LocationSchema,
} from '../../../../location/schema/location.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: LocationSchemaClass.name,
        schema: LocationSchema,
      },
    ]),
  ],
  providers: [LocationSeedService],
  exports: [LocationSeedService],
})
export class LocationSeedModule {}

