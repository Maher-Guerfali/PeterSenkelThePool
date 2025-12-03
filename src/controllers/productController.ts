import { Request, Response, NextFunction } from 'express';
import Product from '../models/Product';
import { ApiError } from '../types/error.types';
import { ProductInput, ProductQueryParams, PaginatedResponse, ProductDocument } from '../types/product.types';

// Create a new product
export const createProduct = async (
  req: Request<{}, {}, ProductInput>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { name, price, category } = req.body;

    const product = await Product.create({
      name: name.trim(),
      price,
      category: category.trim()
    });

    res.status(201).json(product);
  } catch (error) {
    next(error);
  }
};

// Get all products with optional filtering and pagination
export const getProducts = async (
  req: Request<{}, {}, {}, ProductQueryParams>,
  res: Response<PaginatedResponse<ProductDocument>>,
  next: NextFunction
): Promise<void> => {
  try {
    // Parse query parameters with sensible defaults
    const page = Math.max(1, parseInt(req.query.page || '1'));
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit || '10')));
    const skip = (page - 1) * limit;

    // Build filter object based on query params
    const filter: Record<string, unknown> = {};

    if (req.query.category) {
      filter.category = req.query.category.trim();
    }

    // Price range filtering
    if (req.query.minPrice || req.query.maxPrice) {
      const priceFilter: { $gte?: number; $lte?: number } = {};
      
      if (req.query.minPrice) {
        const minPrice = parseFloat(req.query.minPrice);
        if (isNaN(minPrice) || minPrice < 0) {
          throw new ApiError('minPrice must be a valid positive number', 400);
        }
        priceFilter.$gte = minPrice;
      }
      
      if (req.query.maxPrice) {
        const maxPrice = parseFloat(req.query.maxPrice);
        if (isNaN(maxPrice) || maxPrice < 0) {
          throw new ApiError('maxPrice must be a valid positive number', 400);
        }
        priceFilter.$lte = maxPrice;
      }
      
      filter.price = priceFilter;
    }

    // Run query and count in parallel for better performance
    const [products, total] = await Promise.all([
      Product.find(filter)
        .sort({ createdAt: -1 }) // newest first
        .skip(skip)
        .limit(limit)
        .lean(), // lean() returns plain objects instead of Mongoose documents - faster
      Product.countDocuments(filter)
    ]);

    const pages = Math.ceil(total / limit);

    res.json({
      data: products.map(p => ({
        ...p,
        _id: p._id.toString()
      })) as ProductDocument[],
      total,
      page,
      pages
    });
  } catch (error) {
    next(error);
  }
};

// Get single product by ID
export const getProductById = async (
  req: Request<{ id: string }>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      throw new ApiError('Product not found', 404);
    }

    res.json(product);
  } catch (error) {
    // Handle cast errors when ID format is valid but product doesn't exist
    if ((error as Error).name === 'CastError') {
      next(new ApiError('Product not found', 404));
    } else {
      next(error);
    }
  }
};

// Update product fields
export const updateProduct = async (
  req: Request<{ id: string }, {}, Partial<ProductInput>>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const updates: Partial<ProductInput> = {};

    // Only include fields that were actually sent
    if (req.body.name !== undefined) {
      updates.name = req.body.name.trim();
    }
    if (req.body.price !== undefined) {
      updates.price = req.body.price;
    }
    if (req.body.category !== undefined) {
      updates.category = req.body.category.trim();
    }

    const product = await Product.findByIdAndUpdate(
      req.params.id,
      updates,
      { 
        new: true, // return updated document
        runValidators: true // run schema validations on update
      }
    );

    if (!product) {
      throw new ApiError('Product not found', 404);
    }

    res.json(product);
  } catch (error) {
    if ((error as Error).name === 'CastError') {
      next(new ApiError('Product not found', 404));
    } else {
      next(error);
    }
  }
};

// Delete product
export const deleteProduct = async (
  req: Request<{ id: string }>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);

    if (!product) {
      throw new ApiError('Product not found', 404);
    }

    // 204 means success but no content to return
    res.status(204).send();
  } catch (error) {
    if ((error as Error).name === 'CastError') {
      next(new ApiError('Product not found', 404));
    } else {
      next(error);
    }
  }
};
