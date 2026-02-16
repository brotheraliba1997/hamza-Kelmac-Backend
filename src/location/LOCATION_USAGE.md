# Location Schema Usage Guide

## Overview
Location schema multiple countries ki locations ko store karne ke liye banaya gaya hai. Yeh schema flexible hai aur different countries ke location formats ko handle kar sakta hai.

## Schema Structure

### Required Fields
- `country` (String, required) - Country ka naam (e.g., "United States", "India", "United Kingdom")

### Optional Fields
- `countryCode` (String) - ISO country code (e.g., "US", "IN", "GB")
- `state` (String) - State/Province ka naam
- `stateCode` (String) - State/Province code
- `city` (String) - City ka naam
- `address` (String) - Street address
- `postalCode` (String) - ZIP/Postal code
- `timeZone` (String) - Timezone (e.g., "America/New_York", "Asia/Kolkata")
- `latitude` (Number) - Latitude coordinate
- `longitude` (Number) - Longitude coordinate
- `displayName` (String) - Formatted display name
- `isActive` (Boolean, default: true) - Location active hai ya nahi
- `order` (Number, default: 0) - Display order

## Kaise Use Karein

### 1. Module Mein Register Karein

Apne module file mein (e.g., `location.module.ts` ya kisi aur module mein) location schema ko register karein:

```typescript
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { LocationSchemaClass, LocationSchema } from './schema/location.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: LocationSchemaClass.name, schema: LocationSchema }
    ])
  ],
  // ... rest of module
})
export class YourModule {}
```

### 2. Service Mein Inject Karein

Apne service mein location model ko inject karein:

```typescript
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { LocationSchemaClass, LocationSchemaDocument } from './schema/location.schema';

@Injectable()
export class YourService {
  constructor(
    @InjectModel(LocationSchemaClass.name)
    private locationModel: Model<LocationSchemaDocument>,
  ) {}
}
```

### 3. Location Create Karein

```typescript
// Simple location
const location = await this.locationModel.create({
  country: 'India',
  countryCode: 'IN',
  city: 'Mumbai',
  state: 'Maharashtra',
  isActive: true
});

// Complete location with coordinates
const locationWithCoords = await this.locationModel.create({
  country: 'United States',
  countryCode: 'US',
  state: 'New York',
  stateCode: 'NY',
  city: 'New York City',
  address: '123 Main Street',
  postalCode: '10001',
  timeZone: 'America/New_York',
  latitude: 40.7128,
  longitude: -74.0060,
  displayName: 'New York, NY, USA',
  isActive: true
});
```

### 4. Queries

#### Country ke basis par locations find karein:
```typescript
const locations = await this.locationModel.find({ 
  country: 'India',
  isActive: true 
});
```

#### City aur State ke basis par:
```typescript
const location = await this.locationModel.findOne({ 
  country: 'United States',
  state: 'California',
  city: 'Los Angeles'
});
```

#### Text search:
```typescript
const locations = await this.locationModel.find({
  $text: { $search: 'New York' }
});
```

#### Multiple countries ke locations:
```typescript
const locations = await this.locationModel.find({
  country: { $in: ['India', 'United States', 'United Kingdom'] },
  isActive: true
});
```

### 5. Other Models Mein Reference Karein

Agar aap kisi aur model mein location reference karna chahte hain (jaise course ya user model mein):

```typescript
// Course schema mein example
@Prop({
  type: Types.ObjectId,
  ref: LocationSchemaClass.name,
  index: true,
})
location?: Types.ObjectId;
```

Phir populate karte waqt:
```typescript
const course = await this.courseModel
  .findById(courseId)
  .populate('location');
```

## Best Practices

1. **Country Code Use Karein**: Har location ke liye `countryCode` (ISO code) zaroor add karein taaki queries fast ho.
2. **Display Name**: `displayName` field mein formatted location string store karein (e.g., "Mumbai, Maharashtra, India") taaki UI mein easily display ho sake.
3. **Coordinates**: Agar mapping feature hai to `latitude` aur `longitude` add karein.
4. **Indexes**: Schema mein already indexes add kiye gaye hain for efficient queries.
5. **Soft Delete**: `deletedAt` field use karein for soft deletion instead of hard delete.

## Examples for Different Countries

### India:
```typescript
{
  country: 'India',
  countryCode: 'IN',
  state: 'Maharashtra',
  stateCode: 'MH',
  city: 'Mumbai',
  postalCode: '400001',
  timeZone: 'Asia/Kolkata'
}
```

### United States:
```typescript
{
  country: 'United States',
  countryCode: 'US',
  state: 'California',
  stateCode: 'CA',
  city: 'San Francisco',
  postalCode: '94102',
  timeZone: 'America/Los_Angeles'
}
```

### United Kingdom:
```typescript
{
  country: 'United Kingdom',
  countryCode: 'GB',
  state: 'England',
  city: 'London',
  postalCode: 'SW1A 1AA',
  timeZone: 'Europe/London'
}
```

