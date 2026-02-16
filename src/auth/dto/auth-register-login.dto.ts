import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, MinLength } from 'class-validator';
import { Transform } from 'class-transformer';
import { lowerCaseTransformer } from '../../utils/transformers/lower-case.transformer';

export class AuthRegisterLoginDto {
  @ApiProperty({ example: 'test1@example.com', type: String })
  @Transform(lowerCaseTransformer)
  @IsEmail()
  email: string;

  @ApiProperty()
  @MinLength(6)
  password: string;

  @ApiProperty({ example: 'John' })
  @IsNotEmpty()
  firstName: string;

  @ApiProperty({ example: 'Doe' })
  @IsNotEmpty()
  lastName: string;

  @ApiProperty({ example: 'orca-technologies' })
  @IsNotEmpty()
  company: string;

  @ApiProperty({ example: 'web developer' })
  @IsNotEmpty()
  jobTitle: string;

  @ApiProperty({ example: 'hamzaali1997.h@gmail.com' })
  @IsNotEmpty()
  emailAddress: string;

  @ApiProperty({ example: 'hamzaali1997.h@gmail.com' })
  @IsNotEmpty()
  phoneNumber: number;
  @ApiProperty({ example: 'United State America' })
  @IsNotEmpty()
  country: string;
  @ApiProperty({ example: 'United State America' })
  @IsNotEmpty()
  industry: string;
}
