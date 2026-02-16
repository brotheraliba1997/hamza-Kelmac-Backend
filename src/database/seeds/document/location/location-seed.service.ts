import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { LocationSchemaClass } from '../../../../location/schema/location.schema';

@Injectable()
export class LocationSeedService {
  constructor(
    @InjectModel(LocationSchemaClass.name)
    private readonly model: Model<LocationSchemaClass>,
  ) {}

  async run() {
    const locations = [
      { country: 'United States', countryCode: 'US' },
      { country: 'United Kingdom', countryCode: 'GB' },
      { country: 'Canada', countryCode: 'CA' },
      { country: 'Australia', countryCode: 'AU' },
      { country: 'Germany', countryCode: 'DE' },
      { country: 'France', countryCode: 'FR' },
      { country: 'Italy', countryCode: 'IT' },
      { country: 'Spain', countryCode: 'ES' },
      { country: 'Netherlands', countryCode: 'NL' },
      { country: 'Belgium', countryCode: 'BE' },
      { country: 'Switzerland', countryCode: 'CH' },
      { country: 'Austria', countryCode: 'AT' },
      { country: 'Sweden', countryCode: 'SE' },
      { country: 'Norway', countryCode: 'NO' },
      { country: 'Denmark', countryCode: 'DK' },
      { country: 'Finland', countryCode: 'FI' },
      { country: 'Poland', countryCode: 'PL' },
      { country: 'Portugal', countryCode: 'PT' },
      { country: 'Greece', countryCode: 'GR' },
      { country: 'Ireland', countryCode: 'IE' },
      { country: 'India', countryCode: 'IN' },
      { country: 'China', countryCode: 'CN' },
      { country: 'Japan', countryCode: 'JP' },
      { country: 'South Korea', countryCode: 'KR' },
      { country: 'Singapore', countryCode: 'SG' },
      { country: 'Malaysia', countryCode: 'MY' },
      { country: 'Thailand', countryCode: 'TH' },
      { country: 'Indonesia', countryCode: 'ID' },
      { country: 'Philippines', countryCode: 'PH' },
      { country: 'Vietnam', countryCode: 'VN' },
      { country: 'United Arab Emirates', countryCode: 'AE' },
      { country: 'Saudi Arabia', countryCode: 'SA' },
      { country: 'Israel', countryCode: 'IL' },
      { country: 'Turkey', countryCode: 'TR' },
      { country: 'South Africa', countryCode: 'ZA' },
      { country: 'Egypt', countryCode: 'EG' },
      { country: 'Nigeria', countryCode: 'NG' },
      { country: 'Kenya', countryCode: 'KE' },
      { country: 'Brazil', countryCode: 'BR' },
      { country: 'Mexico', countryCode: 'MX' },
      { country: 'Argentina', countryCode: 'AR' },
      { country: 'Chile', countryCode: 'CL' },
      { country: 'Colombia', countryCode: 'CO' },
      { country: 'Peru', countryCode: 'PE' },
      { country: 'New Zealand', countryCode: 'NZ' },
      { country: 'Russia', countryCode: 'RU' },
      { country: 'Ukraine', countryCode: 'UA' },
      { country: 'Czech Republic', countryCode: 'CZ' },
      { country: 'Hungary', countryCode: 'HU' },
      { country: 'Romania', countryCode: 'RO' },
    ];

    for (const locationData of locations) {
      const existingLocation = await this.model.findOne({
        country: locationData.country,
      });

      if (!existingLocation) {
        const location = new this.model(locationData);
        await location.save();
        console.log(`Created location: ${locationData.country}`);
      } else {
        console.log(`Location already exists: ${locationData.country}`);
      }
    }

    const totalLocations = await this.model.countDocuments();
    console.log(`Total locations in database: ${totalLocations}`);
  }
}
