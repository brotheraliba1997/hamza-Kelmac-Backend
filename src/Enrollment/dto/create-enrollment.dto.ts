import { IsEnum, IsMongoId, IsOptional } from 'class-validator';

export class CreateEnrollmentDto {
  @IsMongoId()
  user: string;

  @IsMongoId()
  course: string;

  @IsOptional()
  @IsMongoId()
  payment?: string;

  @IsOptional()
  @IsMongoId()
  offer?: string;

  @IsEnum(['active', 'completed', 'cancelled'])
  @IsOptional()
  status?: string;
}
