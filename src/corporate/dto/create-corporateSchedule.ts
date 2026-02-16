import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsMongoId,
  IsString,
  IsArray,
  IsOptional,
  ArrayNotEmpty,
  IsEmail,
  IsEnum,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { CorporateCreatePaymentDto } from './create-payment.dto';
import { CorporateCreatePurchaseOrderDto } from './create-purchase.dto';

export enum PaymentMethod {
  STRIPE = 'stripe',
  PURCHASEORDER = 'purchase_order',
}

export class CorporateScheduleStudentDto {
  @ApiProperty({
    example: 'John Doe',
    description: 'Student username or full name',
  })
  @IsString()
  firstName: string;

  @ApiProperty({ example: 'Doe', description: 'Student last name' })
  @IsString()
  lastName: string;

  @ApiProperty({
    example: 'john.doe@example.com',
    description: 'Student email',
  })
  @IsEmail()
  email: string;
}

export class CreateCorporateScdeduleDto {
  @ApiProperty({
    example: '671018fabc123456789ef013',
    description: 'Course associated with the class',
  })
  @IsMongoId()
  courseId: string;

  @ApiProperty({
    example: '671018fabc123456789ef013',
    description: 'Course associated with the class',
  })
  @IsMongoId()
  corporateId: string;

  @ApiProperty({
    type: [CorporateScheduleStudentDto],
    example: [
      { firstName: 'John ', lastName: 'Doe', email: 'john.doe@example.com' },
      { firstName: 'John ', lastName: 'Doe', email: 'john.doe@example.com' },
    ],
    description: 'Student username and email (not IDs)',
  })
  @IsArray()
  @ArrayNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => CorporateScheduleStudentDto)
  students: CorporateScheduleStudentDto[];

  @ApiProperty({
    example: '671018fabc123456789ef013',
    description: 'Session ID from course.sessions',
  })
  @IsMongoId()
  sessionId: string;

  @ApiPropertyOptional({
    description:
      'Payment data – when provided, Payment record will be created with corporate schedule',
    type: CorporateCreatePaymentDto,
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => CorporateCreatePaymentDto)
  payment?: CorporateCreatePaymentDto;

  @ApiPropertyOptional({
    description:
      'Purchase Order data – when provided, Purchase Order record will be created with corporate schedule',
    type: CorporateCreatePurchaseOrderDto,
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => CorporateCreatePurchaseOrderDto)
  purchase?: CorporateCreatePurchaseOrderDto;

  @ApiPropertyOptional({
    description: 'stripe or purchase_order',
  })
  @IsOptional()
  @IsString()
  @IsEnum(PaymentMethod)
  SelectedPaymentMethod?: string;
}
