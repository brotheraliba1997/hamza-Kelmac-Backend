# MongoDB ID Sanitization Utilities

## Problem Solved

When working with MongoDB and Mongoose, you often get responses with:
- `_id` as ObjectId buffer objects (not strings)
- Nested `_id` fields in subdocuments (modules, lessons, etc.)
- Populated references showing as `[object Object]`
- Inconsistent ID formats

**Example of the problem:**
```json
{
  "_id": {
    "buffer": { "0": 105, "1": 6, "2": 13, ... }
  },
  "instructor": "[object Object]",
  "modules": [
    {
      "_id": { "buffer": { ... } }
    }
  ]
}
```

## Solution

Use `sanitizeMongooseDocument()` to convert all IDs to clean strings automatically!

## Functions Available

### 1. `sanitizeMongooseDocument<T>(data: any): T`

**Converts a MongoDB document to clean JSON with all IDs as strings.**

```typescript
import { sanitizeMongooseDocument } from '../utils/convert-id';

const rawCourse = await courseModel.findById(id).populate('instructor').lean();
const cleanCourse = sanitizeMongooseDocument(rawCourse);

// Now all _id fields are converted to id strings, including nested ones!
```

**Features:**
- ✅ Converts `_id` → `id` (as string)
- ✅ Handles nested objects recursively
- ✅ Handles arrays recursively
- ✅ Converts ObjectId buffers to hex strings
- ✅ Sanitizes populated references
- ✅ Preserves Date objects
- ✅ Type-safe with generics

### 2. `sanitizeMongooseDocuments<T>(docs: any[]): T[]`

**Sanitizes an array of documents.**

```typescript
const rawCourses = await courseModel.find().lean();
const cleanCourses = sanitizeMongooseDocuments(rawCourses);
```

### 3. `sanitizeReference(ref: any, fields?: string[])`

**Sanitizes a populated reference, optionally extracting specific fields.**

```typescript
// Just get the ID if unpopulated
const instructorId = sanitizeReference(course.instructor);
// Result: "507f1f77bcf86cd799439011"

// Get specific fields if populated
const instructor = sanitizeReference(course.instructor, ['name', 'email']);
// Result: { id: "...", name: "John", email: "john@example.com" }
```

### 4. `convertIdToString(doc: any): string | undefined`

**Simple ID extraction from a document.**

```typescript
const id = convertIdToString(doc);
// Handles both doc.id and doc._id
```

## Real-World Usage

### In a Service (courses.service.ts)

```typescript
import { sanitizeMongooseDocument } from '../utils/convert-id';

private map(doc: any): CourseEntity {
  if (!doc) return undefined as any;
  
  // Sanitize the entire document
  const sanitized = sanitizeMongooseDocument(doc);
  
  return new CourseEntity({
    id: sanitized.id,
    title: sanitized.title,
    instructor: sanitized.instructor, // Already clean!
    modules: sanitized.modules,       // Nested IDs already converted!
    // ... rest of fields
  });
}
```

### In a Controller Response

```typescript
@Get(':id')
async findOne(@Param('id') id: string) {
  const course = await this.coursesService.findById(id);
  
  // Clean response
  return {
    success: true,
    data: sanitizeMongooseDocument(course),
  };
}
```

### With Pagination

```typescript
async findAll() {
  const { data, hasNextPage } = await this.coursesService.findManyWithPagination({
    paginationOptions: { page: 1, limit: 10 }
  });
  
  return {
    data: sanitizeMongooseDocuments(data), // Clean all items
    hasNextPage,
  };
}
```

## Before & After

### ❌ Before (Raw MongoDB response)
```json
{
  "_id": { "buffer": { "0": 105, "1": 6, ... } },
  "instructor": "[object Object]",
  "modules": [
    {
      "_id": { "buffer": { "0": 105, ... } },
      "lessons": [
        { "_id": { "buffer": { ... } } }
      ]
    }
  ]
}
```

### ✅ After (Sanitized)
```json
{
  "id": "69060d2284d06473ad8d8198",
  "instructor": {
    "id": "507f1f77bcf86cd799439011",
    "name": "John Doe",
    "email": "john@example.com"
  },
  "modules": [
    {
      "id": "69060d2284d06473ad8d8199",
      "lessons": [
        { "id": "69060d2284d06473ad8d819a" }
      ]
    }
  ]
}
```

## Summary

**Use this in any service that returns MongoDB documents to ensure clean, consistent API responses!**

```typescript
// Import
import { sanitizeMongooseDocument } from '../utils/convert-id';

// Use
const cleanData = sanitizeMongooseDocument(rawMongooseDoc);
```

That's it! No more messy ObjectId buffers or `[object Object]` in your API responses. 🎉
