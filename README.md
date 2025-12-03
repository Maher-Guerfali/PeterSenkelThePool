# Products API

A RESTful API for managing food and beverage products with search, pagination, and validation capabilities. Built with Node.js, Express, TypeScript, and MongoDB for modern food service and restaurant supply chains.

![API Demo](https://i.ibb.co/p6PZRrKK/Screenshot-2025-12-03-at-20-20-57.png)

## Features

- ✅ Full CRUD operations for products
- ✅ Advanced filtering by category and price range
- ✅ Pagination support
- ✅ Input validation and sanitization
- ✅ Rate limiting for API protection
- ✅ Comprehensive error handling
- ✅ TypeScript with strict type checking
- ✅ Full test coverage with Jest

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Language**: TypeScript
- **Database**: MongoDB (with Mongoose ODM)
- **Testing**: Jest + Supertest
- **Security**: express-rate-limit, express-mongo-sanitize, CORS

## Prerequisites

- Node.js (v16 or higher)
- MongoDB (local installation or MongoDB Atlas account)
- npm or yarn

## Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd products-api
```

2. **Install dependencies**
```bash
npm install
```

3. **Configure environment variables**

Copy the example environment file:
```bash
cp .env.example .env
```

Edit `.env` and configure your MongoDB connection:
```env
PORT=3000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/products-db
# Or for MongoDB Atlas:
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/products-db

RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

## Running the Application

### Development Mode
```bash
npm run dev
```
The API will be available at `http://localhost:3000`

### Production Mode
```bash
npm run build
npm start
```

### Running Tests
```bash
# Run all tests with coverage
npm test

# Run tests in watch mode
npm run test:watch
```

## API Documentation

### Base URL
```
http://localhost:3000/api
```

### Endpoints

#### 1. Create Product
**POST** `/products`

Creates a new product.

**Request Body:**
```json
{
  "name": "Organic Truffle Oil",
  "price": 45.99,
  "category": "Oils & Vinegars"
}
```

**Validation Rules:**
- `name`: Required, non-empty string (max 200 characters)
- `price`: Required, positive number (> 0)
- `category`: Required, non-empty string (max 100 characters)

**Response (201):**
```json
{
  "_id": "674f1234567890abcdef1234",
  "name": "Laptop",
  "price": 999.99,
  "category": "Electronics",
  "createdAt": "2025-12-03T10:30:00.000Z",
  "updatedAt": "2025-12-03T10:30:00.000Z"
}
```

**Error Response (400):**
```json
{
  "message": "Price must be greater than 0",
  "status": 400
}
```

---

#### 2. Get All Products
**GET** `/products`

Retrieves a paginated list of products with optional filtering.

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10, max: 100)
- `category` (optional): Filter by category name
- `minPrice` (optional): Minimum price filter
- `maxPrice` (optional): Maximum price filter

**Examples:**
```bash
# Get first page with default limit
GET /products

# Get page 2 with 20 items per page
GET /products?page=2&limit=20

# Filter by category
GET /products?category=Oils%20%26%20Vinegars

# Filter by price range
GET /products?minPrice=20&maxPrice=100

# Combine filters
GET /products?category=Wines%20%26%20Spirits&minPrice=30&maxPrice=200&page=1&limit=10
```

**Response (200):**
```json
{
  "data": [
    {
      "_id": "674f1234567890abcdef1234",
      "name": "Organic Truffle Oil",
      "price": 45.99,
      "category": "Oils & Vinegars",
      "createdAt": "2025-12-03T10:30:00.000Z",
      "updatedAt": "2025-12-03T10:30:00.000Z"
    }
  ],
  "total": 45,
  "page": 1,
  "pages": 5
}
```

---

#### 3. Get Product by ID
**GET** `/products/:id`

Retrieves a single product by its ID.

**Example:**
```bash
GET /products/674f1234567890abcdef1234
```

**Response (200):**
```json
{
  "_id": "674f1234567890abcdef1234",
  "name": "Organic Truffle Oil",
  "price": 45.99,
  "category": "Oils & Vinegars",
  "createdAt": "2025-12-03T10:30:00.000Z",
  "updatedAt": "2025-12-03T10:30:00.000Z"
}
```

**Error Response (404):**
```json
{
  "message": "Product not found",
  "status": 404
}
```

**Error Response (400):**
```json
{
  "message": "Invalid product ID format",
  "status": 400
}
```

---

#### 4. Update Product
**PATCH** `/products/:id`

Updates one or more fields of an existing product.

**Request Body (partial):**
```json
{
  "name": "Premium Truffle Oil",
  "price": 52.99
}
```

**Notes:**
- All fields are optional, but at least one must be provided
- Only provided fields will be updated
- Same validation rules apply as in product creation

**Response (200):**
```json
{
  "_id": "674f1234567890abcdef1234",
  "name": "Premium Truffle Oil",
  "price": 52.99,
  "category": "Oils & Vinegars",
  "createdAt": "2025-12-03T10:30:00.000Z",
  "updatedAt": "2025-12-03T12:45:00.000Z"
}
```

---

#### 5. Delete Product
**DELETE** `/products/:id`

Deletes a product by its ID.

**Example:**
No content returned on successful deletion.

**Error Response (404):**
```json
{
  "message": "Product not found",
  "status": 404
}
```

---

### Health Check
**GET** `/health`

Returns the API health status.

**Response (200):**
```json
**Pagination behavior:**
- If `page` < 1, it is treated as `1`.
- If `page` > `pages`, the API clamps to the last page and returns an empty page only when `total = 0`; otherwise it returns the last available page.
- `limit` is capped at `100` to prevent abuse.
{
  "status": "ok",
  "timestamp": "2025-12-03T12:00:00.000Z"
}
```

---

## Error Responses

All errors follow a consistent format:

```json
{
  "message": "Error description",
  "status": 400
}
```

### Common Status Codes

- **200 OK**: Successful GET/PATCH request
- **201 Created**: Successful POST request
- **204 No Content**: Successful DELETE request
- **400 Bad Request**: Invalid input or validation error
- **404 Not Found**: Resource not found
- **429 Too Many Requests**: Rate limit exceeded
- **500 Internal Server Error**: Server-side error

---

## Rate Limiting

The API implements rate limiting to prevent abuse:
- **Default**: 100 requests per 15 minutes per IP address
- Configurable via environment variables

When rate limit is exceeded:
```json
{
  "message": "Too many requests from this IP, please try again later",
  "status": 429
}
```

---

## Testing

The project includes comprehensive integration tests covering:
- Product creation with various validation scenarios
- Pagination and filtering logic
- Update operations (partial and full)
- Delete operations
- Error handling and edge cases

Run tests:
```bash
npm test
```

View coverage report:
```bash
npm test -- --coverage
```

---

## Project Structure

```
src/
├── models/           # Mongoose schemas and models
│   └── Product.ts
├── controllers/      # Request handlers and business logic
│   └── productController.ts
├── routes/          # API route definitions
│   └── productRoutes.ts
├── middleware/      # Custom middleware (validation, error handling)
│   ├── validation.ts
│   └── errorHandler.ts
├── types/           # TypeScript type definitions
│   ├── product.types.ts
│   └── error.types.ts
├── config/          # Configuration files
│   └── database.ts
├── __tests__/       # Test files
│   └── integration/
│       └── products.test.ts
└── server.ts        # Application entry point
```

---

## Development Notes

### TypeScript Configuration
- Strict mode enabled
- No `any` types allowed
- Full type safety enforced

### Code Quality
- ESLint configuration included
- Consistent error handling patterns
- Input sanitization against NoSQL injection

### MongoDB Indexes
Optimized indexes for common queries:
- Category + Price (compound index)
- Created date (descending)

---

## Environment Variables Reference

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Server port | 3000 |
| `NODE_ENV` | Environment mode | development |
| `MONGODB_URI` | MongoDB connection string | mongodb://localhost:27017/products-db |
| `RATE_LIMIT_WINDOW_MS` | Rate limit window in ms | 900000 (15 min) |
| `RATE_LIMIT_MAX_REQUESTS` | Max requests per window | 100 |

---

## Security Features

- **CORS**: Enabled for cross-origin requests
- **Rate Limiting**: Prevents API abuse
- **Input Sanitization**: Protection against NoSQL injection
- **Validation**: Strict input validation on all endpoints
- **Error Handling**: Secure error messages (no internal details exposed)

---

## License

ISC

---

## Author

Built as a technical assessment for backend developer position.
