import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
  HttpStatus,
  HttpCode,
  SerializeOptions,
  Req,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiParam,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { Roles } from '../roles/roles.decorator';
import { RoleEnum } from '../roles/roles.enum';
import { AuthGuard } from '@nestjs/passport';

import {
  InfinityPaginationResponse,
  InfinityPaginationResponseDto,
} from '../utils/dto/infinity-pagination-response.dto';
import { NullableType } from '../utils/types/nullable.type';
import { FilterUserDto, QueryUserDto } from './dto/query-user.dto';
import { User } from './domain/user';
import { UsersService } from './users.service';
import { RolesGuard } from '../roles/roles.guard';
import { infinityPagination } from '../utils/infinity-pagination';
import * as geoip from 'geoip-lite';
import { Request } from 'express';

// @ApiBearerAuth()
@Roles(RoleEnum.admin, RoleEnum.instructor)
// @UseGuards(AuthGuard('jwt'), RolesGuard)

@ApiTags('Users')
@Controller({
  path: 'users',
  version: '1',
})
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @ApiCreatedResponse({
    type: User,
  })
  @SerializeOptions({
    groups: ['admin'],
  })
  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createProfileDto: CreateUserDto): Promise<User> {
    return this.usersService.create(createProfileDto);
  }

  @ApiQuery({
    name: 'search',
    required: false,
    type: String,
    description: 'Filter by search',
  })
  @ApiQuery({
    name: 'role',
    required: false,
    type: String,
    description: 'Filter by role',
  })
  @ApiQuery({
    name: 'isActive',
    required: false,
    type: Boolean,
    description: 'Filter by active status',
  })
  @ApiQuery({
    name: 'country',
    required: false,
    type: String,
    description: 'Filter by country',
  })
  @ApiQuery({
    name: 'USD',
    required: false,
    type: String,
    description: 'Filter by currency',
  })
  @ApiQuery({
    name: 'company',
    required: false,
    type: String,
    description: 'Filter by company',
  })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    description: 'Page number',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Items per page',
  })
  @ApiQuery({
    name: 'isDeleted',
    required: false,
    type: Boolean,
    description: 'Filter by deleted status',
  })
  @ApiOkResponse({
    type: InfinityPaginationResponse(User),
  })
  @SerializeOptions({
    groups: ['admin'],
  })
  @Get()
  @HttpCode(HttpStatus.OK)
  async findAll(@Query() query: QueryUserDto & FilterUserDto) {
    const page = query?.page ?? 1;
    let limit = query?.limit ?? 10;
    if (limit > 50) {
      limit = 50;
    }

    return this.usersService.findManyWithPagination({
      filterOptions: query,
      sortOptions: query?.sort,
      paginationOptions: {
        page,
        limit,
      },
    });
  }

  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(RoleEnum.admin)
  @ApiBearerAuth()
  @ApiOkResponse({
    description: 'Geo location from request IP',
    schema: {
      type: 'object',
      properties: {
        ip: { type: 'string' },
        geo: { type: 'object', nullable: true },
      },
    },
  })
  @SerializeOptions({ groups: ['admin'] })
  @Get('regions')
  @HttpCode(HttpStatus.OK)
  regions(@Req() req: Request) {
    const forwarded = req.headers['x-forwarded-for'];
    console.log(forwarded, 'forwarded');
    const ip =
      (Array.isArray(forwarded) ? forwarded[0] : forwarded)
        ?.toString()
        .split(',')[0]
        ?.trim() ??
      req.ip ??
      req.socket?.remoteAddress ??
      null;
    const geo = ip ? geoip.lookup(ip) : null;
    console.log(geo, 'that');
    return { ip, geo };
  }

  @ApiOkResponse({
    type: User,
  })
  @SerializeOptions({
    groups: ['admin'],
  })
  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @ApiParam({
    name: 'id',
    type: String,
    required: true,
  })
  findOne(@Param('id') id: User['id']): Promise<NullableType<User>> {
    return this.usersService.findById(id);
  }

  @ApiOkResponse({
    type: User,
  })
  @SerializeOptions({
    groups: ['admin'],
  })
  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  @ApiParam({
    name: 'id',
    type: String,
    required: true,
  })
  update(
    @Param('id') id: User['id'],
    @Body() updateProfileDto: UpdateUserDto,
  ): Promise<User | null> {
    return this.usersService.update(id, updateProfileDto);
  }

  @Delete(':id')
  @ApiParam({
    name: 'id',
    type: String,
    required: true,
  })
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: User['id']): Promise<void> {
    return this.usersService.remove(id);
  }
}
