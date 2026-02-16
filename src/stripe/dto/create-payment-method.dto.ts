import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber, Min, Max, Length } from 'class-validator';

export class CreatePaymentMethodDto {
  @ApiProperty({
    example: '4242424242424242',
    description: 'Card number (16 digits)',
  })
  @IsString()
  @Length(13, 19)
  cardNumber: string;

  @ApiProperty({
    example: 12,
    description: 'Expiration month (1-12)',
  })
  @IsNumber()
  @Min(1)
  @Max(12)
  expMonth: number;

  @ApiProperty({
    example: 2026,
    description: 'Expiration year (4 digits)',
  })
  @IsNumber()
  @Min(2024)
  expYear: number;

  @ApiProperty({
    example: '123',
    description: 'Card verification code (CVV/CVC)',
  })
  @IsString()
  @Length(3, 4)
  cvc: string;

  @ApiProperty({
    example: 'John Doe',
    description: 'Cardholder name',
  })
  @IsString()
  cardholderName: string;
}
