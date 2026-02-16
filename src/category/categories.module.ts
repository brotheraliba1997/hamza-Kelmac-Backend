import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CategoriesService } from './categories.service';
import { CategoriesController } from './categories.controller';
import { CategorySchemaClass, CategorySchema } from './schema/category.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: CategorySchemaClass.name, schema: CategorySchema },
    ]),
  ],
  controllers: [CategoriesController],
  providers: [CategoriesService],
  exports: [CategoriesService, MongooseModule],
})
export class CategoriesModule {}
