import {
  IsString,
  IsNotEmpty,
  IsArray,
  IsOptional,
  ArrayNotEmpty,
  IsMongoId,
  IsObject,
} from 'class-validator';

export class CreateNotificationDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  message: string;

  @IsString()
  @IsNotEmpty()
  type: string;

  @IsArray()
  @ArrayNotEmpty()
  @IsMongoId({ each: true })
  receiverIds: string[];

  @IsOptional()
  @IsObject()
  meta?: Record<string, any>;
}
