import { PartialType } from '@nestjs/swagger';
import { CreateBookingListDto } from './create-booking.dto';

export class UpdateBookingDto extends PartialType(CreateBookingListDto) {}
