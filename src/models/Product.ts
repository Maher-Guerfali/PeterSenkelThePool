import mongoose, { Schema, Document } from 'mongoose';
import { ProductInput } from '../types/product.types';

// Extend mongoose Document to get all the built-in methods
export interface IProduct extends ProductInput, Document {
  createdAt: Date;
  updatedAt: Date;
}

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
    // Mongoose handles createdAt and updatedAt automatically
    timestamps: true,
    // Remove __v field from responses, makes the JSON cleaner
    versionKey: false
  }
);

// Index for better query performance on common searches
ProductSchema.index({ category: 1, price: 1 });
ProductSchema.index({ createdAt: -1 });

export default mongoose.model<IProduct>('Product', ProductSchema);
