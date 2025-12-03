import { Request, Response, NextFunction } from 'express';
import Product from '../models/Product';
import { ApiError } from '../types/error.types';
import { ProductInput, ProductQueryParams, PaginatedResponse, ProductDocument } from '../types/product.types';

/**
 * Create a new product | Neues Produkt erstellen
 * 
 * EN: Creates a new product in the database with name, price, and category.
 *     Trims whitespace from text fields and validates all inputs.
 * 
 * DE: Erstellt ein neues Produkt in der Datenbank mit Name, Preis und Kategorie.
 *     Entfernt Leerzeichen aus Textfeldern und validiert alle Eingaben.
 * 
 * @param req - Request with ProductInput in body
 * @param res - Response with created product (201)
 * @param next - Error handler
 */
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

/**
 * Get all products with filtering and pagination | Alle Produkte mit Filterung und Paginierung abrufen
 * 
 * EN: Retrieves products with optional filters (category, price range) and pagination.
 *     Supports query params: page, limit, category, minPrice, maxPrice.
 *     Automatically clamps page number to valid range [1, totalPages].
 * 
 * DE: Ruft Produkte mit optionalen Filtern (Kategorie, Preisspanne) und Paginierung ab.
 *     Unterstützt Query-Parameter: page, limit, category, minPrice, maxPrice.
 *     Begrenzt automatisch die Seitenzahl auf den gültigen Bereich [1, Gesamtseiten].
 * 
 * @param req - Request with ProductQueryParams
 * @param res - Response with PaginatedResponse<ProductDocument>
 * @param next - Error handler
 */
export const getProducts = async (
  req: Request<{}, {}, {}, ProductQueryParams>,
  res: Response<PaginatedResponse<ProductDocument>>,
  next: NextFunction
): Promise<void> => {
  try {
    const requestedPage = Math.max(1, parseInt(req.query.page || '1'));
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit || '10')));

    // Build filter object based on query params
    const filter: Record<string, unknown> = {};

    if (req.query.category) {
      filter.category = req.query.category.trim();
    }

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
    const total = await Product.countDocuments(filter);
    const pages = Math.max(1, Math.ceil(total / limit));
    const page = Math.min(requestedPage, pages);
    const skip = (page - 1) * limit;

    const products = await Product.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

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

/**
 * Get single product by ID | Einzelnes Produkt per ID abrufen
 * 
 * EN: Retrieves a single product by its MongoDB ObjectId.
 *     Returns 404 if product not found or ID format is invalid.
 * 
 * DE: Ruft ein einzelnes Produkt über seine MongoDB-ObjectId ab.
 *     Gibt 404 zurück, wenn das Produkt nicht gefunden wird oder das ID-Format ungültig ist.
 * 
 * @param req - Request with id parameter
 * @param res - Response with product document
 * @param next - Error handler
 */
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

/**
 * Update product fields (partial update) | Produktfelder aktualisieren (Teilaktualisierung)
 * 
 * EN: Updates one or more fields of an existing product.
 *     Only provided fields are updated. Empty strings and zero values are filtered out.
 *     Runs schema validation on updates and returns the updated document.
 * 
 * DE: Aktualisiert ein oder mehrere Felder eines bestehenden Produkts.
 *     Nur bereitgestellte Felder werden aktualisiert. Leere Strings und Nullwerte werden herausgefiltert.
 *     Führt Schema-Validierung bei Aktualisierungen durch und gibt das aktualisierte Dokument zurück.
 * 
 * @param req - Request with id parameter and Partial<ProductInput> in body
 * @param res - Response with updated product
 * @param next - Error handler
 */
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

/**
 * Delete product | Produkt löschen
 * 
 * EN: Deletes a product from the database by its ID.
 *     Returns 204 (No Content) on success, 404 if product not found.
 * 
 * DE: Löscht ein Produkt aus der Datenbank anhand seiner ID.
 *     Gibt 204 (Kein Inhalt) bei Erfolg zurück, 404 wenn das Produkt nicht gefunden wurde.
 * 
 * @param req - Request with id parameter
 * @param res - Empty response (204)
 * @param next - Error handler
 */
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
