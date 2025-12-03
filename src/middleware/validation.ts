import { Request, Response, NextFunction } from 'express';
import { ApiError } from '../types/error.types';
import { ProductInput } from '../types/product.types';

// Validate product creation/update data
// Could use a library like Joi, but keeping it simple for this project
export const validateProductInput = (
  req: Request,
  _res: Response,
  next: NextFunction
): void => {
  // For PATCH: filter out empty strings and 0 values so they're treated as "not provided"
  if (req.method === 'PATCH') {
    const body = req.body as Partial<ProductInput>;
    if (body.name === '') delete req.body.name;
    if (body.category === '') delete req.body.category;
    if (body.price === 0) delete req.body.price;
  }

  const { name, price, category } = req.body as Partial<ProductInput>;

  const errors: string[] = [];

  // Check name
  if (name !== undefined) {
    if (typeof name !== 'string' || name.trim().length === 0) {
      errors.push('Name must be a non-empty string');
    } else if (name.length > 200) {
      errors.push('Name cannot exceed 200 characters');
    }
  } else if (req.method === 'POST') {
    // Name is required for creation but optional for updates
    errors.push('Name is required');
  }

  // Check price
  if (price !== undefined) {
    if (typeof price !== 'number' || !Number.isFinite(price)) {
      errors.push('Price must be a valid number');
    } else if (price <= 0) {
      errors.push('Price must be greater than 0');
    }
  } else if (req.method === 'POST') {
    errors.push('Price is required');
  }

  // Check category
  if (category !== undefined) {
    if (typeof category !== 'string' || category.trim().length === 0) {
      errors.push('Category must be a non-empty string');
    } else if (category.length > 100) {
      errors.push('Category cannot exceed 100 characters');
    }
  } else if (req.method === 'POST') {
    errors.push('Category is required');
  }

  // For PATCH requests, at least one valid field should be provided after filtering
  if (req.method === 'PATCH' && name === undefined && price === undefined && category === undefined) {
    errors.push('At least one field (name, price, or category) must be provided with a valid value');
  }

  if (errors.length > 0) {
    throw new ApiError(errors.join(', '), 400);
  }

  next();
};

// Validate MongoDB ObjectId format
export const validateObjectId = (
  req: Request,
  _res: Response,
  next: NextFunction
): void => {
  const { id } = req.params;
  
  // MongoDB ObjectIds are 24 character hex strings
  const objectIdPattern = /^[0-9a-fA-F]{24}$/;
  
  if (!objectIdPattern.test(id)) {
    throw new ApiError('Invalid product ID format', 400);
  }
  
  next();
};
