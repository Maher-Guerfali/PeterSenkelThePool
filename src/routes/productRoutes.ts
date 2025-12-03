import express from 'express';
import {
  createProduct,
  getProducts,
  getProductById,
  updateProduct,
  deleteProduct
} from '../controllers/productController';
import { validateProductInput, validateObjectId } from '../middleware/validation';

const router = express.Router();

// Product routes following REST conventions
router.post('/', validateProductInput, createProduct);
router.get('/', getProducts);
router.get('/:id', validateObjectId, getProductById);
router.patch('/:id', validateObjectId, validateProductInput, updateProduct);
router.delete('/:id', validateObjectId, deleteProduct);

export default router;
