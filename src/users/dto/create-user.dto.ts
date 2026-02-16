import { Transform, Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  MinLength,
  IsString,
  IsNumber,
} from 'class-validator';
import { FileDto } from '../../files/dto/file.dto';
import { RoleDto } from '../../roles/dto/role.dto';
import { StatusDto } from '../../statuses/dto/status.dto';
import { lowerCaseTransformer } from '../../utils/transformers/lower-case.transformer';

export class CreateUserDto {
  @ApiProperty({ example: 'test1@example.com', type: String })
  @Transform(lowerCaseTransformer)
  @IsNotEmpty()
  @IsEmail()
  email: string | null;

  @ApiProperty({ example: '123456', type: String })
  @MinLength(6)
  @IsOptional()
  password?: string;

  @ApiPropertyOptional({ example: 'email', type: String })
  @IsOptional()
  @IsString()
  provider?: string;

  @ApiPropertyOptional({ example: 'social-123', type: String })
  @IsOptional()
  @IsString()
  socialId?: string | null;

  @ApiProperty({ example: 'John', type: String })
  @IsNotEmpty()
  @IsString()
  firstName: string | null;

  @ApiProperty({ example: 'Doe', type: String })
  @IsNotEmpty()
  @IsString()
  lastName: string | null;

  @ApiPropertyOptional({ type: () => FileDto })
  @IsOptional()
  photo?: FileDto | null;

  @ApiPropertyOptional({ type: () => RoleDto })
  @IsOptional()
  @Type(() => RoleDto)
  role?: RoleDto | null;

  @ApiPropertyOptional({ type: () => StatusDto })
  @IsOptional()
  @Type(() => StatusDto)
  status?: StatusDto | null;

  // ✅ Additional fields from your schema

  @ApiProperty({ example: 'Orca Technologies', type: String })
  @IsNotEmpty()
  @IsString()
  company: string;

  @ApiProperty({ example: 'Web Developer', type: String })
  @IsNotEmpty()
  @IsString()
  jobTitle: string;

  @ApiProperty({ example: 'hamzaali1997.h@gmail.com', type: String })
  @IsNotEmpty()
  @IsEmail()
  emailAddress: string;

  @ApiProperty({ example: '923001234567', type: Number })
  @IsNotEmpty()
  @IsNumber()
  phoneNumber: number;

  @ApiProperty({ example: 'United States of America', type: String })
  @IsNotEmpty()
  @IsString()
  country: string;

  @ApiProperty({ example: 'Technology', type: String })
  @IsNotEmpty()
  @IsString()
  industry: string;

  @ApiPropertyOptional({ example: 'USD', type: String })
  @IsOptional()
  @IsString()
  currency?: string;
}
