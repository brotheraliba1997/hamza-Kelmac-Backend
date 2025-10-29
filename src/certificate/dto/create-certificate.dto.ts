import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsMongoId, IsString, IsOptional, IsDate } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateCertificateDto {
  @ApiProperty({
    description: 'The MongoDB ID of the user',
    example: '507f1f77bcf86cd799439011',
  })
  @IsMongoId()
  user: string;

  @ApiProperty({
    description: 'The MongoDB ID of the course',
    example: '507f1f77bcf86cd799439012',
  })
  @IsMongoId()
  course: string;

  @ApiProperty({
    description: 'URL to the certificate file',
    example: 'https://example.com/certificates/cert123.pdf',
  })
  @IsString()
  certificateUrl: string;

  @ApiPropertyOptional({
    description: 'The date when the certificate was issued',
    type: Date,
    example: new Date().toISOString(),
  })
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  issuedDate?: Date;
}
