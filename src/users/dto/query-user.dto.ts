import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Transform, Type, plainToInstance } from 'class-transformer';
import { User } from '../domain/user';
import { RoleDto } from '../../roles/dto/role.dto';

export class FilterUserDto {
  @ApiPropertyOptional({
    example: 'name',
    description: 'Filter by Search',
  })
  @IsOptional()
  @IsBoolean()
  search?: string;

  @ApiPropertyOptional({
    example: 'intrustor',
    description: 'Filter by role',
  })
  @IsOptional()
  @IsBoolean()
  role?: string;

  @ApiPropertyOptional({
    example: 'false',
    description: 'Filter by active status',
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional({
    example: 'false',
    description: 'Filter by deleted status',
  })
  @IsOptional()
  @IsBoolean()
  isDeleted?: boolean;

  @ApiPropertyOptional({
    example: 'web-development',
    description: 'Filter by industry',
  })
  @IsOptional()
  @IsString()
  industry?: string;

  @ApiPropertyOptional({
    example: 'america',
    description: 'Filter by country',
  })
  @IsOptional()
  @IsString()
  country?: string;

  @ApiPropertyOptional({
    example: 'USD',
    description: 'Filter by currency',
  })
  @IsOptional()
  @IsString()
  currency?: string;
}

export class SortUserDto {
  @ApiProperty()
  @Type(() => String)
  @IsString()
  orderBy: keyof User;

  @ApiProperty()
  @IsString()
  order: string;
}

export class QueryUserDto {
  @ApiPropertyOptional()
  @Transform(({ value }) => (value ? Number(value) : 1))
  @IsNumber()
  @IsOptional()
  page?: number;

  @ApiPropertyOptional()
  @Transform(({ value }) => (value ? Number(value) : 10))
  @IsNumber()
  @IsOptional()
  limit?: number;

  // @ApiPropertyOptional({ type: String })
  // @IsOptional()
  // // @Transform(({ value }) =>
  // //   value ? plainToInstance(FilterUserDto, JSON.parse(value)) : undefined,
  // // )
  // // @ValidateNested()
  // @Type(() => FilterUserDto)
  // filters?: FilterUserDto | null;

  @ApiPropertyOptional({ type: String })
  @IsOptional()
  @Transform(({ value }) => {
    return value ? plainToInstance(SortUserDto, JSON.parse(value)) : undefined;
  })
  @ValidateNested({ each: true })
  @Type(() => SortUserDto)
  sort?: SortUserDto[] | null;
}
