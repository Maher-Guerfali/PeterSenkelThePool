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

export interface ProductQueryParams {
  page?: string;
  limit?: string;
  category?: string;
  minPrice?: string;
  maxPrice?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pages: number;
}
