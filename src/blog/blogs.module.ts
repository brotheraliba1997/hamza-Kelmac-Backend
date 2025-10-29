// src/modules/blogs/blogs.module.ts
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { BlogsService } from './blogs.service';
import { BlogsController } from './blogs.controller';
import {
  BlogSchema,
  BlogSchemaClass,
} from './infrastructure/persistence/document/entities/blogs.schema';
import { DocumentBlogsPersistenceModule } from './infrastructure/persistence/document/document-persistence.module';

@Module({
  imports: [
    // MongooseModule.forFeature([
    //   { name: BlogSchemaClass.name, schema: BlogSchema },
    // ]),
    DocumentBlogsPersistenceModule,
  ],
  controllers: [BlogsController],
  providers: [BlogsService],
  exports: [BlogsService, DocumentBlogsPersistenceModule],
})
export class BlogsModule {}
