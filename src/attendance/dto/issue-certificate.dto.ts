import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsMongoId, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class IssueCertificateDto {
  @ApiProperty({
    description: 'Pass/Fail Record ID',
    example: '675f4aaf2b67a23d4c9f2941',
  })
  @IsMongoId()
  @IsNotEmpty()
  recordId: string;

  @ApiProperty({
    description: 'Certificate URL (PDF or link)',
    example: 'https://example.com/certificates/cert123.pdf',
  })
  @IsString()
  @IsNotEmpty()
  certificateUrl: string;

  @ApiPropertyOptional({
    description: 'Certificate ID (if already created)',
    example: '675f4aaf2b67a23d4c9f2941',
  })
  @IsOptional()
  @IsMongoId()
  certificateId?: string;
}

export class BulkIssueCertificatesDto {
  @ApiProperty({
    description: 'Course ID',
    example: '675f4aaf2b67a23d4c9f2941',
  })
  @IsMongoId()
  @IsNotEmpty()
  courseId: string;

  @ApiProperty({
    description: 'Session ID from course.sessions array',
    example: '671018fabc123456789ef015',
  })
  @IsMongoId()
  @IsNotEmpty()
  sessionId: string;

  @ApiProperty({
    description: 'Array of certificate data with recordId and certificateUrl',
    type: 'array',
    items: {
      type: 'object',
      properties: {
        recordId: { type: 'string' },
        certificateUrl: { type: 'string' },
        certificateId: { type: 'string' },
      },
    },
  })
  certificates: Array<{
    recordId: string;
    certificateUrl: string;
    certificateId?: string;
  }>;
}
