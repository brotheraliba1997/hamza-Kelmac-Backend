// dto/create-user.dto.ts
import {
  IsEmail,
  IsEnum,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';

export class CreateUserDto {
  @IsString()
  name: string;

  @IsEmail()
  email: string;

  @MinLength(6)
  password: string;

  @IsEnum(['Student', 'Instructor', 'Corporate', 'Admin'])
  @IsOptional()
  role?: string;

  @IsOptional()
  company?: string;

  @IsOptional()
  country?: string;

  @IsOptional()
  currency?: string;
}
