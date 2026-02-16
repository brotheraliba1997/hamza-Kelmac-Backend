// dto/create-certificate.dto.ts
import { IsMongoId, IsString, IsOptional } from 'class-validator';

export class CreateCertificateDto {
  @IsMongoId()
  user: string;

  @IsMongoId()
  course: string;

  @IsString()
  certificateUrl: string;

  @IsOptional()
  issuedDate?: Date;
}
