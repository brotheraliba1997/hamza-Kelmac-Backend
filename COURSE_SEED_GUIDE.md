# Course Seeds Run Karne Ka Guide

## Prerequisites (Pehle Ye Check Karein)

1. **Database Connection**: `.env` file mein MongoDB connection string sahi hona chahiye
2. **Instructor ID**: Line 87 par `instructorId` ko apne database ke actual instructor ID se replace karein
3. **Location ID**: Line 88 par `locationId` ko apne database ke actual location ID se replace karein
4. **Categories**: Categories pehle se create honi chahiye (seed file automatically create kar deta hai agar nahi hain)

## Step-by-Step Instructions

### Method 1: NPM Script (Recommended) ✅

```bash
npm run seed:courses
```

Yeh command `package.json` mein already defined hai (line 34).

### Method 2: Direct ts-node Command

```bash
npx ts-node -r tsconfig-paths/register ./src/database/seeds/seed-courses.ts
```

### Method 3: Using Node with ts-node

```bash
node -r ts-node/register -r tsconfig-paths/register ./src/database/seeds/seed-courses.ts
```

## Kya Hoga Jab Seed Run Hogi?

1. ✅ Categories check/create hongi (Professional Development, Business Training)
2. ✅ 20 courses create hongi database mein
3. ✅ Har course ke liye:
   - Title, description, slug
   - Category assignment
   - Sessions with instructor & location
   - Pricing information
   - Course metadata (snapshot, details, FAQs)

## Expected Output

```
🌱 Starting course seeding...
✅ Created category: Professional Development
✅ Created category: Business Training
✅ Category IDs:
   - Professional Development: 690bc43d8ddd23690d42287e
   - Business Training: 690bc43d8ddd23690d42287f

✅ Created: Advanced Leadership Mastery (ID: 690ca50a894467cca53ecb93)
✅ Created: Digital Marketing Fundamentals (ID: 690ca50a894467cca53ecb94)
...
⏭️  Skipped: Course Name (already exists)
...

📊 Seeding Summary:
   ✅ Created: 18 courses
   ⏭️  Skipped: 2 courses
   📝 Total: 20 courses

✨ Course seeding completed!
```

## Troubleshooting

### Error: "Category not found"
- Solution: CategoriesService se categories create ho rahi hain automatically, agar error aaye to manually check karein

### Error: "Instructor ID invalid"
- Solution: Line 87 par `instructorId` ko apne database ke valid instructor ID se replace karein
- Instructor ID check karne ke liye MongoDB Compass ya mongo shell use karein

### Error: "Location ID invalid"
- Solution: Line 88 par `locationId` ko apne database ke valid location ID se replace karein
- Location seeds pehle run karein: `npm run seed:location` (agar location seed file hai)

### Error: "Duplicate slug"
- Solution: Seed file automatically unique slug generate karti hai, lekin agar manually slug change karna ho to course data mein slug field update karein

## Important Notes

⚠️ **Duplicate Prevention**: Seed file automatically check karti hai ke course already exist karti hai ya nahi (slug ke basis par). Agar exist karti hai to skip kar deti hai.

⚠️ **Instructor & Location**: Ab instructor aur location sirf sessions ke andar hain, course level par nahi.

⚠️ **Categories**: Agar categories nahi hain to seed file automatically create kar deti hai.

## Seed File Location

📁 `src/database/seeds/seed-courses.ts`

## After Running Seeds

Database mein check karne ke liye:
- MongoDB Compass use karein
- Ya mongo shell: `db.courses.find().pretty()`
- Ya API endpoint use karein: `GET /courses`

