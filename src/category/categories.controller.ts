import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiTags,
  ApiOperation,
  ApiParam,
} from '@nestjs/swagger';
import { CategoriesService } from './categories.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { QueryCategoryDto } from './dto/query-category.dto';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../roles/roles.guard';
import { Roles } from '../roles/roles.decorator';
import { RoleEnum } from '../roles/roles.enum';

@ApiTags('Categories')
@Controller({
  path: 'categories',
  version: '1',
})
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @ApiOperation({ summary: 'Create a new category (Admin only)' })
  @ApiCreatedResponse({ description: 'Category created successfully' })
  @ApiBearerAuth()
  @Roles(RoleEnum.admin)
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Post()
  create(@Body() createCategoryDto: CreateCategoryDto) {
    return this.categoriesService.create(createCategoryDto);
  }

  @ApiOperation({ summary: 'Get all categories with pagination and filters' })
  @ApiOkResponse({ description: 'Categories retrieved successfully' })
  @Get()
  findAll(@Query() queryDto: QueryCategoryDto) {
    return this.categoriesService.findAll(queryDto);
  }

  @ApiOperation({ summary: 'Get featured categories' })
  @ApiOkResponse({ description: 'Featured categories retrieved successfully' })
  @Get('featured')
  getFeatured() {
    return this.categoriesService.getFeaturedCategories();
  }

  @ApiOperation({ summary: 'Get all active categories (for dropdowns)' })
  @ApiOkResponse({ description: 'Active categories retrieved successfully' })
  @Get('active')
  getActive() {
    return this.categoriesService.getActiveCategories();
  }

  @ApiOperation({ summary: 'Get category by slug' })
  @ApiOkResponse({ description: 'Category retrieved successfully' })
  @ApiParam({ name: 'slug', example: 'web-development' })
  @Get('slug/:slug')
  findBySlug(@Param('slug') slug: string) {
    return this.categoriesService.findBySlug(slug);
  }

  @ApiOperation({ summary: 'Get category with stats by slug' })
  @ApiOkResponse({ description: 'Category with stats retrieved successfully' })
  @ApiParam({ name: 'slug', example: 'web-development' })
  @Get('slug/:slug/stats')
  getCategoryStats(@Param('slug') slug: string) {
    return this.categoriesService.getCategoryWithStats(slug);
  }

  @ApiOperation({ summary: 'Get category by ID' })
  @ApiOkResponse({ description: 'Category retrieved successfully' })
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.categoriesService.findOne(id);
  }

  @ApiOperation({ summary: 'Update category (Admin only)' })
  @ApiOkResponse({ description: 'Category updated successfully' })
  @ApiBearerAuth()
  @Roles(RoleEnum.admin)
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateCategoryDto: UpdateCategoryDto,
  ) {
    return this.categoriesService.update(id, updateCategoryDto);
  }

  @ApiOperation({ summary: 'Add subcategory to category (Admin only)' })
  @ApiOkResponse({ description: 'Subcategory added successfully' })
  @ApiBearerAuth()
  @Roles(RoleEnum.admin)
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Post(':id/subcategories')
  addSubcategory(
    @Param('id') id: string,
    @Body('subcategory') subcategory: string,
  ) {
    return this.categoriesService.addSubcategory(id, subcategory);
  }

  @ApiOperation({ summary: 'Remove subcategory from category (Admin only)' })
  @ApiOkResponse({ description: 'Subcategory removed successfully' })
  @ApiBearerAuth()
  @Roles(RoleEnum.admin)
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Delete(':id/subcategories/:subcategory')
  removeSubcategory(
    @Param('id') id: string,
    @Param('subcategory') subcategory: string,
  ) {
    return this.categoriesService.removeSubcategory(id, subcategory);
  }

  @ApiOperation({ summary: 'Soft delete category (Admin only)' })
  @ApiOkResponse({ description: 'Category deleted successfully' })
  @ApiBearerAuth()
  @Roles(RoleEnum.admin)
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string) {
    return this.categoriesService.remove(id);
  }

  @ApiOperation({ summary: 'Permanently delete category (Admin only)' })
  @ApiOkResponse({ description: 'Category permanently deleted' })
  @ApiBearerAuth()
  @Roles(RoleEnum.admin)
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Delete(':id/hard')
  @HttpCode(HttpStatus.NO_CONTENT)
  hardRemove(@Param('id') id: string) {
    return this.categoriesService.hardRemove(id);
  }
}
