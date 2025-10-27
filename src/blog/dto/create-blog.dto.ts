import { IsMongoId, IsOptional, IsString } from 'class-validator';

export class CreateBlogDto {
  @IsString()
  title: string;

  @IsString()
  content: string;

  @IsMongoId()
  author: string;

  @IsOptional()
  comments?: string[];
}
