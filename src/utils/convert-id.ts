/**
 * Converts a MongoDB document ID to a string.
 * Handles both virtual 'id' property and '_id' ObjectId.
 *
 * @param doc - The MongoDB document or any object with id/_id
 * @returns The ID as a string, or undefined if neither exists
 *
 * @example
 * const id = convertIdToString(doc);
 * const id = convertIdToString(user);
 */
export function convertIdToString(doc: any): string | undefined {
  if (!doc) return undefined;

  // Check if virtual 'id' exists (Mongoose virtual field)
  if (typeof doc.id !== 'undefined') {
    return doc.id;
  }

  // Check if '_id' exists and convert to string
  if (doc._id) {
    // Handle ObjectId or any object with toString method
    if (typeof doc._id.toString === 'function') {
      return doc._id.toString();
    }
    // If _id is already a string
    if (typeof doc._id === 'string') {
      return doc._id;
    }
  }

  return undefined;
}

/**
 * Converts a MongoDB document ID to a string with a fallback value.
 *
 * @param doc - The MongoDB document or any object with id/_id
 * @param fallback - The fallback value if ID cannot be extracted (default: '')
 * @returns The ID as a string, or the fallback value
 *
 * @example
 * const id = convertIdToStringOrFallback(doc, 'unknown');
 */
export function convertIdToStringOrFallback(
  doc: any,
  fallback: string = '',
): string {
  return convertIdToString(doc) ?? fallback;
}

/**
 * Extracts and converts IDs from an array of MongoDB documents.
 *
 * @param docs - Array of MongoDB documents
 * @returns Array of ID strings (excludes undefined values)
 *
 * @example
 * const ids = convertIdsToStrings(users);
 */
export function convertIdsToStrings(docs: any[]): string[] {
  if (!Array.isArray(docs)) return [];

  return docs
    .map((doc) => convertIdToString(doc))
    .filter((id): id is string => typeof id === 'string');
}

/**
 * Checks if a value is a MongoDB ObjectId (has buffer property or _bsontype).
 *
 * @param value - The value to check
 * @returns True if the value is an ObjectId
 */
function isObjectId(value: any): boolean {
  if (!value || typeof value !== 'object') return false;

  // Check for ObjectId buffer structure
  if (value.buffer && typeof value.buffer === 'object') {
    return true;
  }

  // Check for _bsontype property
  if (value._bsontype === 'ObjectId') {
    return true;
  }

  // Check if it has toString method and looks like an ObjectId
  if (typeof value.toString === 'function') {
    const str = value.toString();
    return /^[0-9a-fA-F]{24}$/.test(str);
  }

  return false;
}

/**
 * Converts an ObjectId to string, handling buffer-based ObjectIds.
 *
 * @param objectId - The ObjectId to convert
 * @returns The ObjectId as a hex string
 */
function objectIdToString(objectId: any): string {
  // If it has a buffer property, convert buffer to hex string
  if (objectId.buffer) {
    const buffer = objectId.buffer;
    let hex = '';
    for (let i = 0; i < 12; i++) {
      const byte = buffer[i];
      hex += byte.toString(16).padStart(2, '0');
    }
    return hex;
  }

  // Otherwise use toString method
  if (typeof objectId.toString === 'function') {
    return objectId.toString();
  }

  return String(objectId);
}

/**
 * Sanitizes a MongoDB document by converting all ObjectIds to strings
 * and handling nested objects/arrays recursively.
 * Also converts objects with toString to their string representation.
 *
 * @param data - The data to sanitize (object, array, or primitive)
 * @returns Sanitized data with all IDs as strings, or null/undefined if input is null/undefined
 *
 * @example
 * const clean = sanitizeMongooseDocument(course);
 * // Converts all _id fields and ObjectId references to strings
 */
export function sanitizeMongooseDocument<T = any>(
  data: any,
): T | null | undefined {
  // Handle null/undefined
  if (data === null || data === undefined) {
    return data as null | undefined;
  }

  // Handle primitive types
  if (typeof data !== 'object') {
    return data;
  }

  // Handle Date objects - keep as is
  if (data instanceof Date) {
    return data as T;
  }

  // Handle ObjectId - convert to string
  if (isObjectId(data)) {
    return objectIdToString(data) as T;
  }

  // Handle arrays
  if (Array.isArray(data)) {
    return data.map((item) => sanitizeMongooseDocument(item)) as T;
  }

  // Handle objects with toString that are not plain objects
  // (like populated references that appear as [object Object])
  if (
    data.toString &&
    typeof data.toString === 'function' &&
    data.toString() === '[object Object]' &&
    data.constructor &&
    data.constructor.name !== 'Object'
  ) {
    // This is likely a Mongoose document reference
    // Try to extract useful data or convert _id
    if (data._id) {
      return sanitizeMongooseDocument(data._id) as T;
    }
  }

  // Handle plain objects
  const sanitized: any = {};

  for (const key in data) {
    if (!data.hasOwnProperty(key)) continue;

    const value = data[key];

    // Convert _id to id as string
    if (key === '_id') {
      if (isObjectId(value)) {
        sanitized.id = objectIdToString(value);
      } else if (typeof value === 'string') {
        sanitized.id = value;
      } else {
        sanitized.id = sanitizeMongooseDocument(value);
      }
      continue;
    }

    // Recursively sanitize nested objects/arrays
    sanitized[key] = sanitizeMongooseDocument(value);
  }

  return sanitized as T;
}

/**
 * Sanitizes an array of MongoDB documents.
 *
 * @param docs - Array of documents to sanitize
 * @returns Array of sanitized documents
 *
 * @example
 * const cleanCourses = sanitizeMongooseDocuments(courses);
 */
export function sanitizeMongooseDocuments<T = any>(docs: any[]): T[] {
  if (!Array.isArray(docs)) return [];
  return docs.map((doc) => sanitizeMongooseDocument<T>(doc));
}

/**
 * Converts a populated Mongoose reference to a simple object.
 * If the reference is populated, extracts key fields.
 * If not populated, converts the ObjectId to string.
 *
 * @param ref - The reference field (can be populated or just an ID)
 * @param fields - Optional fields to extract if populated
 * @returns Sanitized reference data
 *
 * @example
 * const instructor = sanitizeReference(doc.instructor, ['name', 'email']);
 */
export function sanitizeReference(ref: any, fields?: string[]): any {
  if (!ref) return null;

  // If it's just an ObjectId
  if (isObjectId(ref)) {
    return objectIdToString(ref);
  }

  // If it's a populated document
  if (typeof ref === 'object') {
    const sanitized = sanitizeMongooseDocument(ref);

    // If specific fields requested, extract only those
    if (fields && Array.isArray(fields)) {
      const filtered: any = {};
      fields.forEach((field) => {
        if (sanitized[field] !== undefined) {
          filtered[field] = sanitized[field];
        }
      });
      // Always include id if it exists
      if (sanitized.id) {
        filtered.id = sanitized.id;
      }
      return filtered;
    }

    return sanitized;
  }

  return ref;
}
