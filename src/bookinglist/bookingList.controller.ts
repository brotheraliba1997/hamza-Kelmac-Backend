import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Patch,
  Delete,
} from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';

import { CreateBookingListDto } from './dto/create-booking.dto';
import { UpdateBookingDto } from './dto/update-booking.dto';
import { BookingListService } from './bookingList.services';

@ApiTags('/bookingList')
@Controller({
  path: 'bookingList',
  version: '1',
})
export class BookingListController {
  constructor(private readonly bookingListService: BookingListService) {}

  // @Post()
  // @ApiOperation({ summary: 'Create a new booking' })
  // create(@Body() createBookingDto: CreateBookingListDto) {
  //   return this.bookingListService.create(createBookingDto);
  // }

  @Get()
  @ApiOperation({ summary: 'Get all bookings with populated data' })
  findAll() {
    return this.bookingListService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a single booking by ID' })
  findOne(@Param('id') id: string) {
    return this.bookingListService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update booking details' })
  update(@Param('id') id: string, @Body() updateBookingDto: UpdateBookingDto) {
    return this.bookingListService.update(id, updateBookingDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete booking by ID' })
  remove(@Param('id') id: string) {
    return this.bookingListService.remove(id);
  }
}
