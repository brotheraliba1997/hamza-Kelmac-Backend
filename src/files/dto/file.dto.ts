import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class FileDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  id: string;

  @ApiProperty({ description: 'Relative path or key for the stored file' })
  @IsString()
  @IsNotEmpty()
  path: string;
}
