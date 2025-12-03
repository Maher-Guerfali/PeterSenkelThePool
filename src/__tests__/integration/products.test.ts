import request from 'supertest';
import mongoose from 'mongoose';
import app from '../../server';
import Product from '../../models/Product';

// Set test environment
process.env.NODE_ENV = 'test';

// Use in-memory database for testing
beforeAll(async () => {
  const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/products-test';
  await mongoose.connect(mongoUri);
});

// Clean up database between tests
afterEach(async () => {
  await Product.deleteMany({});
});

// Close connection after all tests
afterAll(async () => {
  await mongoose.connection.close();
});

describe('Product API Integration Tests', () => {
  
  describe('POST /api/products', () => {
    it('should create a new product with valid data', async () => {
      const productData = {
        name: 'Test Laptop',
        price: 999.99,
        category: 'Electronics'
      };

      const response = await request(app)
        .post('/api/products')
        .send(productData)
        .expect(201);

      expect(response.body).toHaveProperty('_id');
      expect(response.body.name).toBe(productData.name);
      expect(response.body.price).toBe(productData.price);
      expect(response.body.category).toBe(productData.category);
      expect(response.body).toHaveProperty('createdAt');
      expect(response.body).toHaveProperty('updatedAt');
    });

    it('should trim whitespace from name and category', async () => {
      const response = await request(app)
        .post('/api/products')
        .send({
          name: '  Trimmed Product  ',
          price: 50,
          category: '  Test Category  '
        })
        .expect(201);

      expect(response.body.name).toBe('Trimmed Product');
      expect(response.body.category).toBe('Test Category');
    });

    it('should reject product without name', async () => {
      const response = await request(app)
        .post('/api/products')
        .send({
          price: 100,
          category: 'Test'
        })
        .expect(400);

      expect(response.body.message).toContain('Name is required');
    });

    it('should reject product with empty name', async () => {
      const response = await request(app)
        .post('/api/products')
        .send({
          name: '   ',
          price: 100,
          category: 'Test'
        })
        .expect(400);

      expect(response.body.message).toContain('non-empty');
    });

    it('should reject product without price', async () => {
      const response = await request(app)
        .post('/api/products')
        .send({
          name: 'Test Product',
          category: 'Test'
        })
        .expect(400);

      expect(response.body.message).toContain('Price is required');
    });

    it('should reject product with negative price', async () => {
      const response = await request(app)
        .post('/api/products')
        .send({
          name: 'Test Product',
          price: -10,
          category: 'Test'
        })
        .expect(400);

      expect(response.body.message).toContain('greater than 0');
    });

    it('should reject product with zero price', async () => {
      const response = await request(app)
        .post('/api/products')
        .send({
          name: 'Test Product',
          price: 0,
          category: 'Test'
        })
        .expect(400);

      expect(response.body.message).toContain('greater than 0');
    });

    it('should reject product without category', async () => {
      const response = await request(app)
        .post('/api/products')
        .send({
          name: 'Test Product',
          price: 100
        })
        .expect(400);

      expect(response.body.message).toContain('Category is required');
    });
  });

  describe('GET /api/products', () => {
    beforeEach(async () => {
      // Create some test products
      await Product.create([
        { name: 'Product 1', price: 100, category: 'Electronics' },
        { name: 'Product 2', price: 200, category: 'Books' },
        { name: 'Product 3', price: 150, category: 'Electronics' },
        { name: 'Product 4', price: 50, category: 'Clothing' },
        { name: 'Product 5', price: 300, category: 'Electronics' }
      ]);
    });

    it('should return all products with default pagination', async () => {
      const response = await request(app)
        .get('/api/products')
        .expect(200);

      expect(response.body.data).toHaveLength(5);
      expect(response.body.total).toBe(5);
      expect(response.body.page).toBe(1);
      expect(response.body.pages).toBe(1);
    });

    it('should filter products by category', async () => {
      const response = await request(app)
        .get('/api/products?category=Electronics')
        .expect(200);

      expect(response.body.data).toHaveLength(3);
      expect(response.body.total).toBe(3);
      expect(response.body.data.every((p: { category: string }) => p.category === 'Electronics')).toBe(true);
    });

    it('should filter products by minimum price', async () => {
      const response = await request(app)
        .get('/api/products?minPrice=150')
        .expect(200);

      expect(response.body.data).toHaveLength(3);
      expect(response.body.data.every((p: { price: number }) => p.price >= 150)).toBe(true);
    });

    it('should filter products by maximum price', async () => {
      const response = await request(app)
        .get('/api/products?maxPrice=150')
        .expect(200);

      expect(response.body.data).toHaveLength(3);
      expect(response.body.data.every((p: { price: number }) => p.price <= 150)).toBe(true);
    });

    it('should filter products by price range', async () => {
      const response = await request(app)
        .get('/api/products?minPrice=100&maxPrice=200')
        .expect(200);

      expect(response.body.data).toHaveLength(3);
      expect(response.body.data.every((p: { price: number }) => p.price >= 100 && p.price <= 200)).toBe(true);
    });

    it('should combine category and price filters', async () => {
      const response = await request(app)
        .get('/api/products?category=Electronics&minPrice=150')
        .expect(200);

      expect(response.body.data).toHaveLength(2);
      expect(response.body.data.every((p: { category: string; price: number }) => 
        p.category === 'Electronics' && p.price >= 150
      )).toBe(true);
    });

    it('should paginate results correctly', async () => {
      const response = await request(app)
        .get('/api/products?page=1&limit=2')
        .expect(200);

      expect(response.body.data).toHaveLength(2);
      expect(response.body.page).toBe(1);
      expect(response.body.pages).toBe(3);
      expect(response.body.total).toBe(5);
    });

    it('should return second page correctly', async () => {
      const response = await request(app)
        .get('/api/products?page=2&limit=2')
        .expect(200);

      expect(response.body.data).toHaveLength(2);
      expect(response.body.page).toBe(2);
    });

    it('should handle invalid minPrice gracefully', async () => {
      const response = await request(app)
        .get('/api/products?minPrice=invalid')
        .expect(400);

      expect(response.body.message).toContain('valid positive number');
    });
  });

  describe('GET /api/products/:id', () => {
    it('should return a single product by ID', async () => {
      const product = await Product.create({
        name: 'Test Product',
        price: 99.99,
        category: 'Test'
      });

      const response = await request(app)
        .get(`/api/products/${product._id}`)
        .expect(200);

      expect(response.body._id).toBe(product._id.toString());
      expect(response.body.name).toBe(product.name);
    });

    it('should return 404 for non-existent product', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      
      const response = await request(app)
        .get(`/api/products/${fakeId}`)
        .expect(404);

      expect(response.body.message).toContain('not found');
    });

    it('should return 400 for invalid ID format', async () => {
      const response = await request(app)
        .get('/api/products/invalid-id')
        .expect(400);

      expect(response.body.message).toContain('Invalid product ID');
    });
  });

  describe('PATCH /api/products/:id', () => {
    it('should update product name', async () => {
      const product = await Product.create({
        name: 'Original Name',
        price: 100,
        category: 'Test'
      });

      const response = await request(app)
        .patch(`/api/products/${product._id}`)
        .send({ name: 'Updated Name' })
        .expect(200);

      expect(response.body.name).toBe('Updated Name');
      expect(response.body.price).toBe(100);
      expect(response.body.category).toBe('Test');
    });

    it('should update product price', async () => {
      const product = await Product.create({
        name: 'Test Product',
        price: 100,
        category: 'Test'
      });

      const response = await request(app)
        .patch(`/api/products/${product._id}`)
        .send({ price: 150 })
        .expect(200);

      expect(response.body.price).toBe(150);
      expect(response.body.name).toBe('Test Product');
    });

    it('should update multiple fields at once', async () => {
      const product = await Product.create({
        name: 'Test Product',
        price: 100,
        category: 'Old Category'
      });

      const response = await request(app)
        .patch(`/api/products/${product._id}`)
        .send({ 
          name: 'New Name',
          price: 200,
          category: 'New Category'
        })
        .expect(200);

      expect(response.body.name).toBe('New Name');
      expect(response.body.price).toBe(200);
      expect(response.body.category).toBe('New Category');
    });

    it('should reject update with invalid price', async () => {
      const product = await Product.create({
        name: 'Test Product',
        price: 100,
        category: 'Test'
      });

      const response = await request(app)
        .patch(`/api/products/${product._id}`)
        .send({ price: -50 })
        .expect(400);

      expect(response.body.message).toContain('greater than 0');
    });

    it('should return 404 for non-existent product', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      
      const response = await request(app)
        .patch(`/api/products/${fakeId}`)
        .send({ name: 'New Name' })
        .expect(404);

      expect(response.body.message).toContain('not found');
    });

    it('should reject update with no fields provided', async () => {
      const product = await Product.create({
        name: 'Test Product',
        price: 100,
        category: 'Test'
      });

      const response = await request(app)
        .patch(`/api/products/${product._id}`)
        .send({})
        .expect(400);

      expect(response.body.message).toContain('At least one field');
    });
  });

  describe('DELETE /api/products/:id', () => {
    it('should delete a product successfully', async () => {
      const product = await Product.create({
        name: 'Test Product',
        price: 100,
        category: 'Test'
      });

      await request(app)
        .delete(`/api/products/${product._id}`)
        .expect(204);

      // Verify product is actually deleted
      const deletedProduct = await Product.findById(product._id);
      expect(deletedProduct).toBeNull();
    });

    it('should return 404 when deleting non-existent product', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      
      const response = await request(app)
        .delete(`/api/products/${fakeId}`)
        .expect(404);

      expect(response.body.message).toContain('not found');
    });

    it('should return 400 for invalid ID format', async () => {
      const response = await request(app)
        .delete('/api/products/invalid-id')
        .expect(400);

      expect(response.body.message).toContain('Invalid product ID');
    });
  });
});
