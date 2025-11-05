# Category-Course Integration

This document describes how the Category module is integrated with the Course module in the Kelmac Backend.

## Overview

The category system allows organizing courses into hierarchical categories with subcategories. The integration ensures:
- Category validation when creating/updating courses
- Automatic course count tracking per category
- Ability to query courses by category or subcategory
- Data consistency between courses and categories

## Architecture

### 1. Category Schema (`src/category/schema/category.schema.ts`)

```typescript
{
  name: string;              // Unique category name
  slug: string;              // URL-friendly slug (auto-generated)
  description?: string;      // Category description
  icon?: string;             // Icon URL or class name
  image?: string;            // Category image URL
  color?: string;            // Hex color for UI
  subcategories: string[];   // Array of subcategory names
  courseCount: number;       // Auto-tracked course count
  order: number;             // Display order
  isActive: boolean;         // Active status
  isFeatured: boolean;       // Featured flag
}
```

### 2. Course Schema Integration

The Course schema includes:
```typescript
{
  category: string;          // Category slug (required)
  subcategories: string[];   // Array of subcategory names
  topics: string[];          // Array of topic tags
  // ... other fields
}
```

## Features

### 1. Automatic Course Count Tracking

When courses are created, updated, or deleted, the category's `courseCount` is automatically updated:

- **Create Course**: Increments category course count
- **Update Course**: If category changes, decrements old category count and increments new category count
- **Delete Course**: Decrements category course count

### 2. Category Validation

When creating or updating a course:
- Validates that the category exists
- Ensures the category is active
- Throws `BadRequestException` if validation fails

### 3. Query Courses by Category

#### By Category Slug
```
GET /v1/courses/category/:categorySlug?page=1&limit=10
```

Example:
```
GET /v1/courses/category/web-development?page=1&limit=10
```

#### By Subcategory
```
GET /v1/courses/subcategory/:subcategory?page=1&limit=10
```

Example:
```
GET /v1/courses/subcategory/Frontend%20Development?page=1&limit=10
```

## API Endpoints

### Category Endpoints

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/v1/categories` | Create category | Admin |
| GET | `/v1/categories` | List categories (paginated) | Public |
| GET | `/v1/categories/featured` | Get featured categories | Public |
| GET | `/v1/categories/active` | Get active categories (dropdown) | Public |
| GET | `/v1/categories/slug/:slug` | Get category by slug | Public |
| GET | `/v1/categories/slug/:slug/stats` | Get category with stats | Public |
| GET | `/v1/categories/:id` | Get category by ID | Public |
| PATCH | `/v1/categories/:id` | Update category | Admin |
| POST | `/v1/categories/:id/subcategories` | Add subcategory | Admin |
| DELETE | `/v1/categories/:id/subcategories/:subcategory` | Remove subcategory | Admin |
| DELETE | `/v1/categories/:id` | Soft delete category | Admin |
| DELETE | `/v1/categories/:id/hard` | Hard delete category | Admin |

### Course Endpoints (Category-Related)

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/v1/courses/category/:categorySlug` | Get courses by category | Public |
| GET | `/v1/courses/subcategory/:subcategory` | Get courses by subcategory | Public |
| POST | `/v1/courses` | Create course (validates category) | Instructor/Admin |
| PATCH | `/v1/courses/:id` | Update course (validates category) | Instructor/Admin |

## Usage Examples

### 1. Create a Category

```http
POST /v1/categories
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "name": "Web Development",
  "description": "Learn web development from basics to advanced",
  "icon": "fas fa-code",
  "color": "#3498db",
  "subcategories": ["Frontend Development", "Backend Development"],
  "order": 1,
  "isActive": true,
  "isFeatured": true
}
```

Response:
```json
{
  "id": "673b1c2d3e4f5a6b7c8d9e0f",
  "name": "Web Development",
  "slug": "web-development",
  "description": "Learn web development from basics to advanced",
  "icon": "fas fa-code",
  "color": "#3498db",
  "subcategories": ["Frontend Development", "Backend Development"],
  "courseCount": 0,
  "order": 1,
  "isActive": true,
  "isFeatured": true,
  "createdAt": "2025-11-06T10:00:00.000Z",
  "updatedAt": "2025-11-06T10:00:00.000Z"
}
```

### 2. Create a Course with Category

```http
POST /v1/courses
Content-Type: application/json

{
  "title": "Complete Web Development Bootcamp",
  "description": "Master web development with this comprehensive course",
  "instructor": "507f1f77bcf86cd799439011",
  "category": "web-development",
  "subcategories": ["Frontend Development"],
  "topics": ["HTML", "CSS", "JavaScript", "React"],
  "price": 99.99,
  "isPublished": true
}
```

This will:
1. Validate that "web-development" category exists and is active
2. Create the course
3. Increment the course count for "web-development" category
4. Send notification emails

### 3. Get Courses by Category

```http
GET /v1/courses/category/web-development?page=1&limit=10
```

Response:
```json
{
  "data": [
    {
      "id": "673b1c2d3e4f5a6b7c8d9e10",
      "title": "Complete Web Development Bootcamp",
      "description": "Master web development...",
      "category": "web-development",
      "subcategories": ["Frontend Development"],
      "price": 99.99,
      // ... other fields
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 15,
    "totalPages": 2
  }
}
```

### 4. Get Category with Stats

```http
GET /v1/categories/slug/web-development/stats
```

Response:
```json
{
  "id": "673b1c2d3e4f5a6b7c8d9e0f",
  "name": "Web Development",
  "slug": "web-development",
  "courseCount": 15,
  "subcategories": ["Frontend Development", "Backend Development"],
  "isActive": true,
  "isFeatured": true
}
```

### 5. Update Course Category

```http
PATCH /v1/courses/673b1c2d3e4f5a6b7c8d9e10
Content-Type: application/json

{
  "category": "mobile-development"
}
```

This will:
1. Validate that "mobile-development" exists and is active
2. Decrement course count for "web-development"
3. Increment course count for "mobile-development"
4. Update the course

### 6. Get Active Categories (for Dropdown)

```http
GET /v1/categories/active
```

Response:
```json
[
  {
    "id": "673b1c2d3e4f5a6b7c8d9e0f",
    "name": "Web Development",
    "slug": "web-development",
    "subcategories": ["Frontend Development", "Backend Development"],
    "icon": "fas fa-code",
    "color": "#3498db"
  },
  {
    "id": "673b1c2d3e4f5a6b7c8d9e11",
    "name": "Mobile Development",
    "slug": "mobile-development",
    "subcategories": ["iOS Development", "Android Development"],
    "icon": "fas fa-mobile",
    "color": "#e74c3c"
  }
]
```

## Service Integration

### CoursesService

```typescript
class CoursesService {
  constructor(
    private courseModel: Model<CourseSchemaClass>,
    private categoriesService: CategoriesService,
  ) {}

  async create(dto: CreateCourseDto) {
    // 1. Validate category
    const category = await this.categoriesService.findBySlug(dto.category);
    
    // 2. Create course
    const course = await this.courseModel.create(dto);
    
    // 3. Increment category count
    await this.categoriesService.incrementCourseCount(dto.category);
    
    return course;
  }

  async update(id: string, dto: UpdateCourseDto) {
    const existing = await this.courseModel.findById(id);
    
    // Handle category change
    if (dto.category && dto.category !== existing.category) {
      await this.categoriesService.decrementCourseCount(existing.category);
      await this.categoriesService.incrementCourseCount(dto.category);
    }
    
    return await this.courseModel.findByIdAndUpdate(id, dto);
  }

  async remove(id: string) {
    const course = await this.courseModel.findById(id);
    
    // Decrement category count
    await this.categoriesService.decrementCourseCount(course.category);
    
    await this.courseModel.deleteOne({ _id: id });
  }
}
```

## Data Consistency

### Category Deletion Protection

Categories with existing courses cannot be deleted:

```typescript
async remove(id: string) {
  const category = await this.categoryModel.findById(id);
  
  if (category.courseCount > 0) {
    throw new BadRequestException(
      'Cannot delete category with existing courses. Please reassign or delete courses first.'
    );
  }
  
  // Soft delete
  await this.categoryModel.findByIdAndUpdate(id, {
    deletedAt: new Date(),
    isActive: false,
  });
}
```

### Course Count Synchronization

The `courseCount` field is automatically maintained through:
- Course creation hooks
- Course update hooks
- Course deletion hooks

If counts become out of sync, you can create a manual sync script:

```typescript
async syncCategoryCounts() {
  const categories = await this.categoryModel.find();
  
  for (const category of categories) {
    const count = await this.courseModel.countDocuments({
      category: category.slug
    });
    
    await this.categoryModel.updateOne(
      { _id: category._id },
      { courseCount: count }
    );
  }
}
```

## Best Practices

1. **Always use category slugs** in the course schema, not IDs
2. **Validate categories** before creating courses
3. **Handle errors gracefully** when category operations fail
4. **Use transactions** for critical operations (optional for MongoDB)
5. **Cache active categories** for better performance
6. **Index category fields** for faster queries

## Database Indexes

### Category Collection
- `{ name: 1 }` - Unique index
- `{ slug: 1 }` - Unique index
- `{ name: 1, isActive: 1 }` - Compound index
- `{ isFeatured: 1, isActive: 1 }` - Compound index
- `{ name: 'text', description: 'text' }` - Text search index

### Course Collection
- `{ category: 1, subcategories: 1 }` - Compound index
- `{ category: 1, isPublished: 1 }` - Compound index
- `{ title: 'text', description: 'text', category: 'text' }` - Text search index

## Migration Guide

If you have existing courses without categories:

1. Create default categories
2. Run migration script to assign categories to courses
3. Update category course counts

```typescript
async migrateCourses() {
  // Create default category
  const defaultCategory = await this.categoriesService.create({
    name: 'General',
    slug: 'general',
    isActive: true,
  });

  // Update courses without category
  await this.courseModel.updateMany(
    { category: { $exists: false } },
    { category: 'general' }
  );

  // Sync counts
  await this.syncCategoryCounts();
}
```

## Testing

Example test cases:

```typescript
describe('Category-Course Integration', () => {
  it('should increment category count when creating course', async () => {
    const category = await createCategory({ name: 'Test Category' });
    await createCourse({ category: category.slug });
    
    const updated = await findCategory(category.id);
    expect(updated.courseCount).toBe(1);
  });

  it('should prevent deleting category with courses', async () => {
    const category = await createCategory({ name: 'Test' });
    await createCourse({ category: category.slug });
    
    await expect(deleteCategory(category.id)).rejects.toThrow(
      'Cannot delete category with existing courses'
    );
  });

  it('should validate category when creating course', async () => {
    await expect(
      createCourse({ category: 'non-existent' })
    ).rejects.toThrow('Category does not exist');
  });
});
```

## Troubleshooting

### Issue: Category count is incorrect

**Solution**: Run the sync script to recalculate counts from actual course data.

### Issue: Category validation fails

**Solution**: Ensure the category slug matches exactly (case-sensitive) and is active.

### Issue: Courses not appearing in category query

**Solution**: Verify that `isPublished` is true for the courses.

---

For more information, see:
- [Category Module Documentation](./categories.md)
- [Course Module Documentation](./courses.md)
- [API Documentation](./api.md)
