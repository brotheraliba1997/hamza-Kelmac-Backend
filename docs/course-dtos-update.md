# Course DTOs Update Summary

All Course DTOs have been updated to match the comprehensive course schema.

## ✅ Updates Completed

### 1. **CreateCourseDto** - Comprehensive Course Creation

#### Sub-DTOs Created:
- **TopicItemDto**: Individual topics within sessions
  - `title`, `description`, `isCompleted`, `order`
  
- **SessionDto**: Course sessions/lectures
  - Basic: `title`, `description`, `sessionType` (enum)
  - Timing: `startTime`, `endTime` (HH:MM format), `duration`
  - Content: `videoUrl`, `content`, `resources[]`
  - Organization: `order`, `dayGroup`, `dayNumber`
  - Features: `isFree`, `isBreak`, `color`, `topics[]`
  
- **FAQDto**: Frequently asked questions
  - `question`, `answer`
  
- **CourseSnapshotDto**: Course metadata
  - `totalLectures`, `totalDuration`, `skillLevel` (enum)
  - `language`, `captionsLanguage`, `enrolledStudents`
  - `certificate`, `lifetimeAccess`, `mobileAccess`
  
- **CourseDetailsDto**: Learning objectives and requirements
  - `whatYouWillLearn[]`, `requirements[]`
  - `targetAudience[]`, `features[]`

#### Main CreateCourseDto Fields:

**Basic Information:**
- `title` (required)
- `slug` (optional, auto-generated)
- `subtitle`, `description`
- `instructor` (required, MongoId)

**Category & Classification:**
- `category` (required)
- `subcategories[]`, `topics[]`

**Course Overview:**
- `overview`, `thumbnailUrl`, `previewVideoUrl`

**Syllabus & Content:**
- `sessions[]` (SessionDto array)

**Course Metadata:**
- `snapshot` (CourseSnapshotDto)
- `details` (CourseDetailsDto)
- `faqs[]` (FAQDto array)

**Pricing:**
- `price`, `discountedPrice`, `discountPercentage`
- `currency` (enum: USD, EUR, GBP, INR)

**Stats & Engagement:**
- `enrolledCount`, `averageRating`, `totalReviews`, `totalRatings`

**Publishing & Status:**
- `isPublished`, `isFeatured`, `isBestseller`, `isNew`
- `publishedAt`, `lastUpdated`

#### Validation Rules:
- ✅ All enums validated (`SessionTypeEnum`, `SkillLevelEnum`, `CurrencyEnum`)
- ✅ Time format validation (HH:MM regex)
- ✅ Hex color validation (#RRGGBB)
- ✅ Number ranges (price ≥ 0, rating 0-5, discount 0-100)
- ✅ Nested validation with `@ValidateNested()`
- ✅ Type transformation with `@Type()`

---

### 2. **UpdateCourseDto** - Partial Update

```typescript
export class UpdateCourseDto extends PartialType(CreateCourseDto) {}
```

- All CreateCourseDto fields made optional
- Same validation rules apply when fields are provided

---

### 3. **FilterCourseDto** - Enhanced Query Filtering

#### New Filter Options:

**Category Filters:**
- `category` - Filter by category slug
- `subcategory` - Filter by subcategory name
- `topic` - Filter by topic tag

**Boolean Filters:**
- `isPublished` - Published status
- `isFeatured` - Featured courses
- `isBestseller` - Bestseller flag
- `isNew` - New courses

**Range Filters:**
- `minPrice` / `maxPrice` - Price range
- `minRating` - Minimum rating (0-5)

**Metadata Filters:**
- `skillLevel` - Skill level enum
- `language` - Course language

**Search:**
- `search` - Full-text search (uses MongoDB text index)

**Existing:**
- `instructorId` - Filter by instructor

#### Validation & Transform:
- ✅ Boolean transform from string ('true' → true)
- ✅ Number transform from string
- ✅ Min/Max constraints
- ✅ Enum validation

---

### 4. **SortCourseDto** - Enhanced Sorting

**Sortable Fields:**
- `createdAt`, `updatedAt`, `publishedAt`
- `title`, `price`
- `enrolledCount`, `averageRating`

**Sort Order:**
- `ASC` or `DESC`

---

### 5. **QueryCourseDto** - Pagination

- `page` - Page number (min: 1, default: 1)
- `limit` - Items per page (min: 1, max: 50, default: 10)

---

## 🔧 Service Updates

### Enhanced `findManyWithPagination()`:

```typescript
const filterQuery = new FilterQueryBuilder<CourseSchemaClass>()
  .addEqual('instructor', filterOptions?.instructorId)
  .addEqual('category', filterOptions?.category)
  .addEqual('isPublished', filterOptions?.isPublished)
  .addEqual('isFeatured', filterOptions?.isFeatured)
  .addEqual('isBestseller', filterOptions?.isBestseller)
  .addEqual('isNew', filterOptions?.isNew)
  .addRange('price', filterOptions?.minPrice, filterOptions?.maxPrice)
  .build();

// Additional filters for nested and array fields
if (filterOptions?.subcategory) {
  additionalFilters.subcategories = filterOptions.subcategory;
}

if (filterOptions?.topic) {
  additionalFilters.topics = filterOptions.topic;
}

if (filterOptions?.minRating) {
  additionalFilters.averageRating = { $gte: filterOptions.minRating };
}

if (filterOptions?.skillLevel) {
  additionalFilters['snapshot.skillLevel'] = filterOptions.skillLevel;
}

if (filterOptions?.language) {
  additionalFilters['snapshot.language'] = filterOptions.language;
}

if (filterOptions?.search) {
  additionalFilters.$text = { $search: filterOptions.search };
}
```

---

## 📡 API Usage Examples

### Create Course with Full Schema

```http
POST /v1/courses
Content-Type: application/json

{
  "title": "Complete Web Development Bootcamp 2025",
  "slug": "web-dev-bootcamp-2025",
  "subtitle": "From Zero to Full-Stack Hero",
  "description": "Master web development...",
  "instructor": "507f1f77bcf86cd799439011",
  "category": "web-development",
  "subcategories": ["Frontend Development", "Backend Development"],
  "topics": ["HTML", "CSS", "JavaScript", "React", "Node.js"],
  "overview": "This comprehensive course...",
  "thumbnailUrl": "https://example.com/thumbnail.jpg",
  "previewVideoUrl": "https://example.com/preview.mp4",
  "sessions": [
    {
      "title": "Introduction to JavaScript",
      "description": "Learn the basics",
      "sessionType": "lecture",
      "startTime": "09:00",
      "endTime": "10:30",
      "duration": 90,
      "videoUrl": "https://example.com/video.mp4",
      "isFree": true,
      "order": 1,
      "dayGroup": "DAY 01",
      "dayNumber": 1,
      "topics": [
        {
          "title": "Variables",
          "description": "Understanding variables",
          "order": 1
        }
      ],
      "resources": ["https://example.com/slides.pdf"],
      "color": "#3498db"
    }
  ],
  "snapshot": {
    "totalLectures": 120,
    "totalDuration": 40,
    "skillLevel": "Beginner",
    "language": "English",
    "certificate": true,
    "lifetimeAccess": true,
    "mobileAccess": true
  },
  "details": {
    "whatYouWillLearn": [
      "Build modern web applications",
      "Master JavaScript and React"
    ],
    "requirements": [
      "Basic computer skills",
      "Text editor installed"
    ],
    "targetAudience": [
      "Beginners in web development"
    ],
    "features": [
      "Lifetime access",
      "Certificate of completion"
    ]
  },
  "faqs": [
    {
      "question": "What are the prerequisites?",
      "answer": "Basic programming knowledge recommended"
    }
  ],
  "price": 199.99,
  "discountedPrice": 149.99,
  "discountPercentage": 25,
  "currency": "USD",
  "isPublished": true,
  "isFeatured": true,
  "isNew": true
}
```

### Query Courses with Filters

```http
GET /v1/courses?page=1&limit=10&category=web-development&minRating=4.5&isPublished=true&isFeatured=true
```

```http
GET /v1/courses?search=javascript&skillLevel=Beginner&minPrice=0&maxPrice=100
```

```http
GET /v1/courses?instructorId=507f1f77bcf86cd799439011&isPublished=true&isBestseller=true
```

```http
GET /v1/courses?subcategory=Frontend%20Development&topic=React&language=English
```

---

## ✅ Validation Examples

### Time Format Validation
```typescript
startTime: "09:00" ✅
startTime: "9:00"  ✅
startTime: "25:00" ❌ Invalid hour
startTime: "09:65" ❌ Invalid minute
```

### Color Validation
```typescript
color: "#3498db" ✅
color: "#FFF"    ❌ Must be 6 digits
color: "blue"    ❌ Must be hex
```

### Enum Validation
```typescript
sessionType: "lecture" ✅
sessionType: "break"   ✅
sessionType: "custom"  ❌ Not in enum

skillLevel: "Beginner" ✅
skillLevel: "beginner" ❌ Case sensitive

currency: "USD" ✅
currency: "JPY" ❌ Not in enum
```

### Range Validation
```typescript
price: 99.99        ✅
price: -10          ❌ Min: 0

averageRating: 4.5  ✅
averageRating: 5.5  ❌ Max: 5

discountPercentage: 25  ✅
discountPercentage: 101 ❌ Max: 100
```

---

## 🎯 Benefits

1. **Type Safety**: Full TypeScript typing with enums
2. **Validation**: Comprehensive validation at DTO level
3. **Documentation**: Auto-generated Swagger docs
4. **Flexibility**: Optional fields allow partial updates
5. **Searchability**: Text search + advanced filtering
6. **Scalability**: Nested structures support complex courses
7. **Consistency**: DTOs match schema exactly

---

## 📝 Files Updated

1. `src/course/dto/create-course.dto.ts` - Complete rewrite with sub-DTOs
2. `src/course/dto/update-course.dto.ts` - Already using PartialType
3. `src/course/dto/query-course.dto.ts` - Enhanced with 10+ new filters
4. `src/course/dto/index.ts` - Barrel export created
5. `src/course/courses.service.ts` - Enhanced filter logic
6. `src/course/courses.controller.ts` - Updated to use new DTOs

---

All DTOs are now production-ready and fully aligned with the course schema! 🚀
