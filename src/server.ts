import express, { Application } from 'express';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import morgan from 'morgan';
import dotenv from 'dotenv';
import swaggerUi from 'swagger-ui-express';
import { swaggerSpec } from './config/swagger';
import { connectDatabase } from './config/database';
import productRoutes from './routes/productRoutes';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';

// Load environment variables
dotenv.config();

const app: Application = express();
const PORT = process.env.PORT || 3000;

// CORS - allow requests from any origin (fine for a test API)
app.use(cors());

// Request logging - 'dev' format is concise and readable
app.use(morgan('dev'));

// Parse JSON request bodies
app.use(express.json());

// Rate limiting to prevent abuse
// Default: 100 requests per 15 minutes per IP
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'),
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100'),
  message: 'Too many requests from this IP, please try again later',
  standardHeaders: true,
  legacyHeaders: false,
});

app.use('/api/', limiter);

// Swagger API Documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'Products API Documentation'
}));

// Health check endpoint
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Convenience: redirect root to API docs in hosted envs
app.get('/', (_req, res) => {
  res.redirect('/api-docs');
});

// Database health: reports MongoDB connection state
app.get('/health/db', (_req, res) => {
  // 0: disconnected, 1: connected, 2: connecting, 3: disconnecting
  const state = require('mongoose').connection.readyState as 0|1|2|3;
  const states = ['disconnected', 'connected', 'connecting', 'disconnecting'];
  const started = Date.now();
  require('mongoose').connection.db?.admin()?.ping().then(() => {
    const latencyMs = Date.now() - started;
    res.json({ status: states[state], latencyMs });
  }).catch(() => {
    res.status(500).json({ status: states[state], message: 'db ping failed' });
  });
});

// API routes
app.use('/api/products', productRoutes);

// Handle 404s
app.use(notFoundHandler);

// Centralized error handling
app.use(errorHandler);

// Start server only after database connection is established
const startServer = async (): Promise<void> => {
  try {
    await connectDatabase();
    
    app.listen(PORT, () => {
      console.log(`✓ Server running on port ${PORT}`);
      console.log(`✓ Environment: ${process.env.NODE_ENV || 'development'}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

export default app;
