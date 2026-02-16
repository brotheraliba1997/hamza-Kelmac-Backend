import { FilterQuery, Model, SortOrder } from 'mongoose';
import { IPaginationOptions } from './types/pagination-options';

export interface SortOption {
  orderBy?: string;
  order?: 'ASC' | 'DESC';
}

export interface QueryBuilderOptions<T> {
  model: Model<T>;
  filterQuery?: FilterQuery<T>;
  sortOptions?: SortOption[] | null;
  paginationOptions: IPaginationOptions;
  populateFields?:
    | string
    | Array<{
        path: string;
        select?: string;
        populate?: any; // Support nested populate
        model?: string;
        options?: any;
      }>;
  selectFields?: string;
}

export interface PaginationResult<R> {
  data: R[];
  totalItems: number;
  totalPages: number;
  currentPage: number;
  limit: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

/**
 * Generic utility function for building Mongoose queries with filtering, sorting, and pagination
 * @param options - Query builder configuration options
 * @returns Pagination result with data and metadata
 */
export async function buildMongooseQuery<T, R = T>(
  options: QueryBuilderOptions<T> & { mapper?: (doc: any) => R },
): Promise<PaginationResult<R>> {
  const {
    model,
    filterQuery = {},
    sortOptions,
    paginationOptions,
    populateFields,
    selectFields,
    mapper,
  } = options;

  // Build sort object
  const sort: Record<string, SortOrder> = sortOptions?.reduce(
    (accumulator, sortOption) => {
      const field =
        sortOption.orderBy === 'id' ? '_id' : sortOption.orderBy || 'createdAt';
      const order: SortOrder =
        sortOption.order?.toUpperCase() === 'ASC' ? 1 : -1;
      return {
        ...accumulator,
        [field]: order,
      };
    },
    {} as Record<string, SortOrder>,
  ) ?? { createdAt: -1 };

  // Build query
  let query = model
    .find(filterQuery)
    .sort(sort)
    .skip((paginationOptions.page - 1) * paginationOptions.limit)
    .limit(paginationOptions.limit);

  // Add population if specified
  if (populateFields) {
    if (typeof populateFields === 'string') {
      query = query.populate(populateFields);
    } else if (Array.isArray(populateFields)) {
      populateFields.forEach((field) => {
        // Support nested populate by passing the entire field object
        query = query.populate(field);
      });
    }
  }

  // Add field selection if specified
  if (selectFields) {
    query = query.select(selectFields);
  }

  // Execute query
  const docs = await query.lean();

  // Get total count for pagination metadata
  const totalItems = await model.countDocuments(filterQuery);
  const totalPages = Math.ceil(totalItems / paginationOptions.limit);
  const currentPage = paginationOptions.page;

  // Apply mapper if provided
  const data = mapper
    ? docs.map((doc: any) => mapper(doc))
    : (docs as unknown as R[]);

  return {
    data,
    totalItems,
    totalPages,
    currentPage,
    limit: paginationOptions.limit,
    hasNextPage: currentPage < totalPages,
    hasPreviousPage: currentPage > 1,
  };
}

/**
 * Build filter query for common patterns
 */
export class FilterQueryBuilder<T> {
  private filter: Record<string, any> = {};

  /**
   * Add equality filter
   */
  addEqual(field: keyof T, value: any): this {
    if (value !== undefined && value !== null) {
      this.filter[field as string] = value;
    }
    return this;
  }

  /**
   * Add range filter (e.g., for numbers or dates)
   */
  addRange(field: keyof T, min?: number | Date, max?: number | Date): this {
    if (min !== undefined || max !== undefined) {
      this.filter[field as string] = {};
      if (min !== undefined) {
        this.filter[field as string].$gte = min;
      }
      if (max !== undefined) {
        this.filter[field as string].$lte = max;
      }
    }
    return this;
  }

  /**
   * Add text search filter (case-insensitive regex)
   */
  addTextSearch(field: keyof T, searchTerm?: string): this {
    if (searchTerm) {
      this.filter[field as string] = { $regex: searchTerm, $options: 'i' };
    }
    return this;
  }

  /**
   * Add "in array" filter
   */
  addIn(field: keyof T, values?: any[]): this {
    if (values && values.length > 0) {
      this.filter[field as string] = { $in: values };
    }
    return this;
  }

  /**
   * Add custom filter condition
   */
  addCustom(field: keyof T, condition: any): this {
    if (condition !== undefined && condition !== null) {
      this.filter[field as string] = condition;
    }
    return this;
  }

  /**
   * Build and return the filter query
   */
  build(): FilterQuery<T> {
    return this.filter as FilterQuery<T>;
  }
}
