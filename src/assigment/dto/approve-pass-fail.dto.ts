import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsMongoId,
  IsNotEmpty,
  IsOptional,
  IsBoolean,
  IsString,
} from 'class-validator';

export class ApprovePassFailDto {
  @ApiProperty({
    description: 'Pass/Fail Record ID',
    example: '675f4aaf2b67a23d4c9f2941',
  })
  @IsMongoId()
  @IsNotEmpty()
  recordId: string;

  @ApiProperty({
    description: 'Approve the pass/fail status',
    example: true,
  })
  @IsBoolean()
  @IsNotEmpty()
  approve: boolean;

  @ApiPropertyOptional({
    description: 'Optional notes',
    example: 'Approved after review',
  })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiPropertyOptional({
    description:
      'Certificate URL - if provided and record is PASS, certificate will be issued automatically',
    example: 'https://example.com/certificates/cert123.pdf',
  })
  @IsOptional()
  @IsString()
  certificateUrl?: string;

  @ApiPropertyOptional({
    description:
      'PDF filename for certificate - if provided, certificateUrl will be generated automatically',
    example: 'Certificate No. 1.pdf',
  })
  @IsOptional()
  @IsString()
  pdfFileName?: string;

  @ApiPropertyOptional({
    description: 'Operator ID (will be taken from auth context in production)',
    example: '675f4aaf2b67a23d4c9f2941',
  })
  @IsOptional()
  @IsMongoId()
  operatorId?: string;
}

export class GetPassFailRecordsDto {
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

  @ApiPropertyOptional({
    description: 'Filter by status (PASS/FAIL)',
    example: 'PASS',
  })
  @IsOptional()
  status?: 'PASS' | 'FAIL';

  @ApiPropertyOptional({
    description: 'Filter by approval status',
    example: true,
  })
  @IsOptional()
  @IsBoolean()
  isApproved?: boolean;

  @ApiPropertyOptional({
    description: 'Filter by certificate issued status',
    example: false,
  })
  @IsOptional()
  @IsBoolean()
  certificateIssued?: boolean;
}
