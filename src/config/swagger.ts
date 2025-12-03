import swaggerJsdoc from 'swagger-jsdoc';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Products API - The Pool',
      version: '1.0.0',
      description: 'REST API for managing food and beverage products with search, pagination, and validation.',
      contact: {
        name: 'API Support',
      },
    },
    // Provide both local and current-host servers for dropdown selection
    servers: [
      {
        url: '/',
        description: 'Current host (Render or local)'
      },
      {
        url: 'http://localhost:3000',
        description: 'Local development'
      }
    ],
    components: {
      schemas: {
        Product: {
          type: 'object',
          required: ['name', 'price', 'category'],
          properties: {
            _id: {
              type: 'string',
              description: 'Product ID (auto-generated)',
              example: '674f1234567890abcdef1234',
            },
            name: {
              type: 'string',
              description: 'Product name',
              example: 'Organic Truffle Oil',
              minLength: 1,
              maxLength: 200,
            },
            price: {
              type: 'number',
              description: 'Product price (must be positive)',
              example: 45.99,
              minimum: 0.01,
            },
            category: {
              type: 'string',
              description: 'Product category',
              example: 'Oils & Vinegars',
              minLength: 1,
              maxLength: 100,
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'Creation timestamp',
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
              description: 'Last update timestamp',
            },
          },
        },
        ProductInput: {
          type: 'object',
          required: ['name', 'price', 'category'],
          properties: {
            name: {
              type: 'string',
              example: 'Organic Truffle Oil',
            },
            price: {
              type: 'number',
              example: 45.99,
            },
            category: {
              type: 'string',
              example: 'Oils & Vinegars',
            },
          },
        },
        PaginatedResponse: {
          type: 'object',
          properties: {
            data: {
              type: 'array',
              items: {
                $ref: '#/components/schemas/Product',
              },
            },
            total: {
              type: 'integer',
              example: 45,
            },
            page: {
              type: 'integer',
              example: 1,
            },
            pages: {
              type: 'integer',
              example: 5,
            },
          },
        },
        Error: {
          type: 'object',
          properties: {
            message: {
              type: 'string',
              example: 'Product not found',
            },
            status: {
              type: 'integer',
              example: 404,
            },
          },
        },
      },
    },
  },
  apis: [
    './src/routes/*.ts',  // For development
    './dist/routes/*.js'  // For production
  ],
};

export const swaggerSpec = swaggerJsdoc(options);
