# Mongoose Query Builder Utility

A reusable utility for building Mongoose queries with filtering, sorting, and pagination.

## Location
`src/utils/mongoose-query-builder.ts`

## Features

- ✅ **Generic query building** - Works with any Mongoose model
- ✅ **Flexible filtering** - Support for equality, range, text search, and custom filters
- ✅ **Dynamic sorting** - Multiple sort fields with ASC/DESC
- ✅ **Pagination** - Built-in skip/limit support
- ✅ **Population** - Auto-populate referenced fields
- ✅ **Type-safe** - Full TypeScript support
- ✅ **Mapper support** - Transform documents to domain entities

## Usage Examples

### Basic Example - Simple Query

```typescript
import { buildMongooseQuery } from '../utils/mongoose-query-builder';

async findAll(): Promise<CourseEntity[]> {
  return buildMongooseQuery({
    model: this.courseModel,
    paginationOptions: { page: 1, limit: 10 },
    mapper: (doc) => this.map(doc),
  });
}
```

### Advanced Example - With Filtering and Sorting

```typescript
import { 
  buildMongooseQuery, 
  FilterQueryBuilder 
} from '../utils/mongoose-query-builder';

async findManyWithPagination({
  filterOptions,
  sortOptions,
  paginationOptions,
}: {
  filterOptions?: FilterCourseDto | null;
  sortOptions?: SortCourseDto[] | null;
  paginationOptions: IPaginationOptions;
}): Promise<CourseEntity[]> {
  // Build filter query
  const filterQuery = new FilterQueryBuilder<CourseSchemaClass>()
    .addEqual('instructor' as any, filterOptions?.instructorId)
    .addEqual('isPublished' as any, filterOptions?.isPublished)
    .addRange('price' as any, filterOptions?.minPrice, filterOptions?.maxPrice)
    .build();

  // Execute query
  return buildMongooseQuery({
    model: this.courseModel,
    filterQuery,
    sortOptions,
    paginationOptions,
    populateFields: [{ path: 'instructor', select: 'name email' }],
    mapper: (doc) => this.map(doc),
  });
}
```

### Example - Text Search

```typescript
// Search enrollments by user or course
const filterQuery = new FilterQueryBuilder<EnrollmentSchemaClass>()
  .addEqual('status' as any, 'active')
  .addTextSearch('notes' as any, searchTerm)
  .build();

return buildMongooseQuery({
  model: this.enrollmentModel,
  filterQuery,
  sortOptions: [{ orderBy: 'createdAt', order: 'DESC' }],
  paginationOptions: { page: 1, limit: 20 },
  mapper: (doc) => this.map(doc),
});
```

### Example - Multiple Population

```typescript
return buildMongooseQuery({
  model: this.enrollmentModel,
  filterQuery,
  sortOptions,
  paginationOptions,
  populateFields: [
    { path: 'user', select: 'name email' },
    { path: 'course', select: 'title price' },
    { path: 'certificate', select: 'certificateUrl' },
  ],
  mapper: (doc) => this.map(doc),
});
```

### Example - Custom Filters

```typescript
const filterQuery = new FilterQueryBuilder<BlogSchemaClass>()
  .addEqual('author' as any, authorId)
  .addCustom('publishedDate' as any, { 
    $gte: startDate, 
    $lte: endDate 
  })
  .addIn('tags' as any, ['tech', 'programming'])
  .build();
```

## FilterQueryBuilder Methods

### `addEqual(field, value)`
Add exact match filter. Skips if value is undefined or null.

```typescript
.addEqual('status' as any, 'active')
.addEqual('isPublished' as any, true)
```

### `addRange(field, min, max)`
Add range filter for numbers or dates.

```typescript
.addRange('price' as any, 0, 1000)
.addRange('createdAt' as any, startDate, endDate)
```

### `addTextSearch(field, searchTerm)`
Add case-insensitive regex search.

```typescript
.addTextSearch('title' as any, 'javascript')
```

### `addIn(field, values)`
Filter by array of values.

```typescript
.addIn('category' as any, ['tech', 'science'])
```

### `addCustom(field, condition)`
Add custom MongoDB query condition.

```typescript
.addCustom('metadata' as any, { $exists: true })
```

### `build()`
Build and return the final FilterQuery.

```typescript
const query = builder.build();
```

## buildMongooseQuery Options

```typescript
interface QueryBuilderOptions<T> {
  model: Model<T>;                    // Mongoose model
  filterQuery?: FilterQuery<T>;       // Filter conditions
  sortOptions?: SortOption[];         // Sort configuration
  paginationOptions: IPaginationOptions; // Page and limit
  populateFields?: string | Array<{   // Fields to populate
    path: string; 
    select?: string;
  }>;
  selectFields?: string;              // Fields to select
  mapper?: (doc: any) => R;          // Transform function
}
```

## Migration Guide

### Before (Manual Implementation)

```typescript
async findManyWithPagination(options): Promise<CourseEntity[]> {
  const where: FilterQuery<CourseSchemaClass> = {};
  
  if (filterOptions?.instructorId) {
    where['instructor'] = filterOptions.instructorId;
  }
  
  if (filterOptions?.isPublished !== undefined) {
    where['isPublished'] = filterOptions.isPublished;
  }
  
  const sort = sortOptions?.reduce((acc, s) => ({
    ...acc,
    [s.orderBy === 'id' ? '_id' : s.orderBy]: 
      s.order?.toUpperCase() === 'ASC' ? 1 : -1,
  }), {}) ?? { createdAt: -1 };
  
  const docs = await this.courseModel
    .find(where)
    .sort(sort)
    .skip((paginationOptions.page - 1) * paginationOptions.limit)
    .limit(paginationOptions.limit)
    .populate('instructor', 'name email')
    .lean();
    
  return docs.map(d => this.map(d));
}
```

### After (Using Utility)

```typescript
async findManyWithPagination(options): Promise<CourseEntity[]> {
  const filterQuery = new FilterQueryBuilder<CourseSchemaClass>()
    .addEqual('instructor' as any, filterOptions?.instructorId)
    .addEqual('isPublished' as any, filterOptions?.isPublished)
    .build();

  return buildMongooseQuery({
    model: this.courseModel,
    filterQuery,
    sortOptions,
    paginationOptions,
    populateFields: [{ path: 'instructor', select: 'name email' }],
    mapper: (doc) => this.map(doc),
  });
}
```

## Benefits

1. **DRY Principle** - No code duplication across services
2. **Consistency** - Same query logic everywhere
3. **Maintainability** - Update once, applies everywhere
4. **Type Safety** - Compile-time error checking
5. **Testability** - Easier to mock and test
6. **Readability** - Clean, declarative syntax

## Best Practices

1. Always use `FilterQueryBuilder` for complex queries
2. Use type assertions (`as any`) for field names when needed
3. Chain methods for cleaner code
4. Always provide a mapper function for consistent data transformation
5. Use populate for referenced fields to avoid N+1 queries
6. Set reasonable pagination limits to prevent performance issues
