import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CategorySchemaClass } from './schema/category.schema';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { QueryCategoryDto } from './dto/query-category.dto';
import {
  sanitizeMongooseDocument,
  sanitizeMongooseDocuments,
} from '../utils/convert-id';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectModel(CategorySchemaClass.name)
    private categoryModel: Model<CategorySchemaClass>,
  ) {}

  /**
   * Generate slug from name
   */
  private generateSlug(name: string): string {
    return name
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  /**
   * Create a new category
   */
  async create(createCategoryDto: CreateCategoryDto) {
    // Generate slug if not provided
    const slug =
      createCategoryDto.slug || this.generateSlug(createCategoryDto.name);

    // Check if category with same name or slug already exists
    const existingCategory = await this.categoryModel.findOne({
      $or: [{ name: createCategoryDto.name }, { slug: slug }],
    });

    if (existingCategory) {
      throw new ConflictException(
        'Category with this name or slug already exists',
      );
    }

    const category = new this.categoryModel({
      ...createCategoryDto,
      slug,
    });

    const savedCategory = await category.save();
    return sanitizeMongooseDocument(savedCategory.toObject());
  }

  /**
   * Find all categories with pagination and filters
   */
  async findAll(queryDto: QueryCategoryDto) {
    const { page = 1, limit = 10, search, isActive, isFeatured } = queryDto;
    const skip = (page - 1) * limit;

    // Build filter
    const filter: any = {};

    if (isActive !== undefined) {
      filter.isActive = isActive;
    }

    if (isFeatured !== undefined) {
      filter.isFeatured = isFeatured;
    }

    if (search) {
      filter.$text = { $search: search };
    }

    // Execute query
    const [categories, total] = await Promise.all([
      this.categoryModel
        .find(filter)
        .sort({ order: 1, name: 1 })
        .skip(skip)
        .limit(limit)
        .lean()
        .exec(),
      this.categoryModel.countDocuments(filter),
    ]);

    return {
      data: sanitizeMongooseDocuments(categories),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * Find one category by ID
   */
  async findOne(id: string) {
    const category = await this.categoryModel.findById(id).lean().exec();

    if (!category) {
      throw new NotFoundException('Category not found');
    }

    return sanitizeMongooseDocument(category);
  }

  /**
   * Find category by slug
   */
  async findBySlug(slug: string) {
    const category = await this.categoryModel
      .findOne({ slug, isActive: true })
      .lean()
      .exec();

    if (!category) {
      throw new NotFoundException('Category not found');
    }

    return sanitizeMongooseDocument(category);
  }

  /**
   * Update category
   */
  async update(id: string, updateCategoryDto: UpdateCategoryDto) {
    // Check if category exists
    const category = await this.categoryModel.findById(id);

    if (!category) {
      throw new NotFoundException('Category not found');
    }

    // If name is being updated, regenerate slug
    if (updateCategoryDto.name) {
      updateCategoryDto.slug = this.generateSlug(updateCategoryDto.name);

      // Check if new name or slug conflicts with another category
      const existingCategory = await this.categoryModel.findOne({
        _id: { $ne: id },
        $or: [
          { name: updateCategoryDto.name },
          { slug: updateCategoryDto.slug },
        ],
      });

      if (existingCategory) {
        throw new ConflictException(
          'Category with this name or slug already exists',
        );
      }
    }

    const updatedCategory = await this.categoryModel
      .findByIdAndUpdate(id, updateCategoryDto, { new: true })
      .lean()
      .exec();

    return sanitizeMongooseDocument(updatedCategory);
  }

  /**
   * Soft delete category
   */
  async remove(id: string) {
    const category = await this.categoryModel.findById(id);

    if (!category) {
      throw new NotFoundException('Category not found');
    }

    // Check if category has courses
    if (category.courseCount > 0) {
      throw new BadRequestException(
        'Cannot delete category with existing courses. Please reassign or delete courses first.',
      );
    }

    await this.categoryModel.findByIdAndUpdate(id, {
      deletedAt: new Date(),
      isActive: false,
    });

    return { message: 'Category deleted successfully' };
  }

  /**
   * Permanently delete category
   */
  async hardRemove(id: string) {
    const category = await this.categoryModel.findById(id);

    if (!category) {
      throw new NotFoundException('Category not found');
    }

    // Check if category has courses
    if (category.courseCount > 0) {
      throw new BadRequestException(
        'Cannot delete category with existing courses. Please reassign or delete courses first.',
      );
    }

    await this.categoryModel.findByIdAndDelete(id);

    return { message: 'Category permanently deleted' };
  }

  /**
   * Add subcategory to a category
   */
  async addSubcategory(id: string, subcategory: string) {
    const category = await this.categoryModel.findById(id);

    if (!category) {
      throw new NotFoundException('Category not found');
    }

    if (category.subcategories.includes(subcategory)) {
      throw new ConflictException('Subcategory already exists');
    }

    category.subcategories.push(subcategory);
    await category.save();

    return sanitizeMongooseDocument(category.toObject());
  }

  /**
   * Remove subcategory from a category
   */
  async removeSubcategory(id: string, subcategory: string) {
    const category = await this.categoryModel.findById(id);

    if (!category) {
      throw new NotFoundException('Category not found');
    }

    const index = category.subcategories.indexOf(subcategory);
    if (index === -1) {
      throw new NotFoundException('Subcategory not found');
    }

    category.subcategories.splice(index, 1);
    await category.save();

    return sanitizeMongooseDocument(category.toObject());
  }

  /**
   * Increment course count for a category
   */
  async incrementCourseCount(categoryName: string) {
    await this.categoryModel.updateOne(
      { name: categoryName },
      { $inc: { courseCount: 1 } },
    );
  }

  /**
   * Decrement course count for a category
   */
  async decrementCourseCount(categoryName: string) {
    await this.categoryModel.updateOne(
      { name: categoryName },
      { $inc: { courseCount: -1 } },
    );
  }

  /**
   * Get featured categories
   */
  async getFeaturedCategories() {
    const categories = await this.categoryModel
      .find({ isFeatured: true, isActive: true })
      .sort({ order: 1, name: 1 })
      .lean()
      .exec();

    return sanitizeMongooseDocuments(categories);
  }

  /**
   * Get all active categories (for dropdowns)
   */
  async getActiveCategories() {
    const categories = await this.categoryModel
      .find({ isActive: true })
      .select('name slug subcategories icon color')
      .sort({ order: 1, name: 1 })
      .lean()
      .exec();

    return sanitizeMongooseDocuments(categories);
  }

  /**
   * Validate if a category exists and is active
   */
  async validateCategory(categorySlug: string): Promise<boolean> {
    const category = await this.categoryModel
      .findOne({ slug: categorySlug, isActive: true })
      .lean()
      .exec();

    return !!category;
  }

  /**
   * Get category with course count
   */
  async getCategoryWithStats(slug: string) {
    const category = await this.categoryModel
      .findOne({ slug, isActive: true })
      .lean()
      .exec();

    if (!category) {
      throw new NotFoundException('Category not found');
    }

    return sanitizeMongooseDocument(category);
  }
}
