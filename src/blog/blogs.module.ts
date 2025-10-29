// src/modules/blogs/blogs.module.ts
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { BlogsService } from './blogs.service';
import { BlogsController } from './blogs.controller';
import {
  BlogSchema,
  BlogSchemaClass,
} from './infrastructure/persistence/document/entities/blog.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: BlogSchemaClass.name, schema: BlogSchema },
    ]),
  ],
  controllers: [BlogsController],
  providers: [BlogsService],
  exports: [BlogsService],
})
export class BlogsModule {}
