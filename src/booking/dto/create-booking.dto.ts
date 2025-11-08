import { ApiProperty } from '@nestjs/swagger';
import { IsMongoId, IsEnum, IsOptional, IsString } from 'class-validator';

export enum BookingStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  CANCELLED = 'cancelled',
}

export class CreateBookingDto {
  @ApiProperty({ description: 'Student ID', example: '671a23f8abc123...' })
  @IsMongoId()
  studentId: string;

  @ApiProperty({
    description: 'Course ID',
    example: '670105cc456dbd8ea48ecdf3',
  })
  @IsMongoId()
  courseId: string;

  @ApiProperty({
    description: 'Selected timetable ID',
    example: '670bbb9871fa82325d15dfad',
  })
  @IsMongoId()
  timeTableId: string;

  @ApiProperty({
    description: 'Payment ID',
    example: '670c9fd871fa82325d15df11',
  })
  @IsMongoId()
  paymentId: string;

  @ApiProperty({
    description: 'Booking status',
    enum: BookingStatus,
    example: BookingStatus.PENDING,
    required: false,
  })
  @IsEnum(BookingStatus)
  @IsOptional()
  status?: BookingStatus;

  @ApiProperty({
    description: 'Optional notes or message',
    example: 'Excited to start the class!',
    required: false,
  })
  @IsString()
  @IsOptional()
  notes?: string;
}
