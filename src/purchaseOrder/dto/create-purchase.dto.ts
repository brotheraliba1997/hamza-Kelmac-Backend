import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsMongoId,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsDateString,
} from 'class-validator';

export class CreatePurchaseOrderDto {
  @ApiProperty({
    description: 'Unique purchase order identifier provided by finance',
    example: 'PO-2025-00045',
  })
  @IsString()
  @IsNotEmpty()
  poNumber: string;

  @ApiProperty({
    description: 'Student user ID associated with the request',
    example: '675f4aaf2b67a23d4c9f2941',
  })
  @IsMongoId()
  studentId: string;

  @ApiProperty({
    description: 'Target course to enroll once the PO is approved',
    example: '675f4aaf2b67a23d4c9f2941',
  })
  @IsMongoId()
  courseId: string;

  @ApiProperty({
    description: 'Finance reviewer/contact user ID',
    example: '6841ca06ebdfea1c5e6a0e73',
  })
  @IsMongoId()
  financialContactId: string;

  @ApiProperty({
    description: 'URL or storage path of the uploaded bank slip / proof',
    example: 'https://cdn.kelmac.com/uploads/bank-slips/PO-2025-00045.png',
  })
  @IsString()
  @IsNotEmpty()
  bankSlipUrl: string;

  @ApiPropertyOptional({
    description:
      'Timestamp when the PO was submitted (defaults to current time if omitted)',
    example: '2025-02-18T10:30:00.000Z',
  })
  @IsOptional()
  @IsDateString()
  submittedAt?: string;
}
