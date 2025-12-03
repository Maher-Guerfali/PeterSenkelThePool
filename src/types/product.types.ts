// Type definitions for Product-related operations
// Keeping these separate makes the codebase easier to maintain

export interface ProductInput {
  name: string;
  price: number;
  category: string;
}

export interface ProductDocument extends ProductInput {
  _id: string;
  createdAt: Date;
  updatedAt: Date;
}

// Query params for filtering and pagination
export interface ProductQueryParams {
  page?: string;
  limit?: string;
  category?: string;
  minPrice?: string;
  maxPrice?: string;
}

// Response format for paginated results
export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pages: number;
}
