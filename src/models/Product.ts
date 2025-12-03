import mongoose, { Schema, Document } from 'mongoose';
import { ProductInput } from '../types/product.types';

/**
 * Product Interface | Produkt-Interface
 * 
 * EN: Extends the base ProductInput with MongoDB Document methods and timestamps.
 * DE: Erweitert das Basis-ProductInput mit MongoDB-Document-Methoden und Zeitstempeln.
 */
export interface IProduct extends ProductInput, Document {
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Product Schema | Produkt-Schema
 * 
 * EN: MongoDB schema defining product structure with validation rules:
 *     - name: 1-200 characters, required, trimmed
 *     - price: positive number, required, validated
 *     - category: 1-100 characters, required, trimmed
 *     Includes indexes for performance optimization.
 * 
 * DE: MongoDB-Schema, das die Produktstruktur mit Validierungsregeln definiert:
 *     - name: 1-200 Zeichen, erforderlich, getrimmt
 *     - price: positive Zahl, erforderlich, validiert
 *     - category: 1-100 Zeichen, erforderlich, getrimmt
 *     Enthält Indizes zur Leistungsoptimierung.
 */
const ProductSchema = new Schema<IProduct>(
  {
    name: {
      type: String,
      required: [true, 'Product name is required'],
      trim: true,
      minlength: [1, 'Product name cannot be empty'],
      maxlength: [200, 'Product name is too long']
    },
    price: {
      type: Number,
      required: [true, 'Price is required'],
      min: [0.01, 'Price must be greater than 0'],
      // Store as decimal but validate properly
      validate: {
        validator: function(value: number) {
          return value > 0 && Number.isFinite(value);
        },
        message: 'Price must be a valid positive number'
      }
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      trim: true,
      minlength: [1, 'Category cannot be empty'],
      maxlength: [100, 'Category name is too long']
    }
  },
  {
    timestamps: true,
    versionKey: false
  }
);

ProductSchema.index({ category: 1, price: 1 });
ProductSchema.index({ createdAt: -1 });

export default mongoose.model<IProduct>('Product', ProductSchema);
