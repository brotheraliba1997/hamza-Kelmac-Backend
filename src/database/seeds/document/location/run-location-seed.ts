import { NestFactory } from '@nestjs/core';
import { LocationSeedService } from './location-seed.service';

import { SeedModule } from '../seed.module';

const runLocationSeed = async () => {
  const app = await NestFactory.create(SeedModule);

  // Run location seed
  await app.get(LocationSeedService).run();

  await app.close();
};

void runLocationSeed();

