import { InjectModel } from '@nestjs/mongoose';
// import { Blog, BlogDocument } from '../schema/Blog/blog.schema';
import { CreateBlogDto } from './dto/create-blog.dto';
import { UpdateBlogDto } from './dto/update-blog.dto';
import { Model } from 'mongoose';
import { Injectable } from '@nestjs/common';
import {
  BlogSchemaClass,
  BlogSchemaDocument,
} from './infrastructure/persistence/document/entities/blog.schema';

@Injectable()
export class BlogsService {
  constructor(
    @InjectModel(BlogSchemaClass.name)
    private model: Model<BlogSchemaDocument>,
  ) {}

  create(dto: CreateBlogDto) {
    return this.model.create(dto);
  }
  findAll() {
    return this.model.find().populate('author', 'name').lean();
  }
  findOne(id: string) {
    return this.model.findById(id).populate('author').lean();
  }
  update(id: string, dto: UpdateBlogDto) {
    return this.model.findByIdAndUpdate(id, dto, { new: true }).lean();
  }
  remove(id: string) {
    return this.model.findByIdAndDelete(id);
  }
}
