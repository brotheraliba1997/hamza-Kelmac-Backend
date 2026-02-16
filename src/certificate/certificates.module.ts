// certificates.module.ts
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CertificatesService } from './certificates.service';
import { CertificatesController } from './certificates.controller';
import {
  CertificateSchemaClass,
  CertificateSchema,
} from './schema/certificate.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: CertificateSchemaClass.name, schema: CertificateSchema },
    ]),
  ],
  controllers: [CertificatesController],
  providers: [CertificatesService],
})
export class CertificatesModule {}
