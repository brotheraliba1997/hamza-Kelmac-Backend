import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { BlogSchema, BlogSchemaClass } from './entities/blogs.schema';
import { BlogRepository } from './repositories/blog.repository';
import { BlogsDocumentRepository } from '../../blogs.repository';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: BlogSchemaClass.name, schema: BlogSchema },
    ]),
  ],
  providers: [
    {
      provide: BlogRepository,
      useClass: BlogsDocumentRepository,
    },
  ],
  exports: [BlogRepository],
})
export class DocumentBlogsPersistenceModule {}
