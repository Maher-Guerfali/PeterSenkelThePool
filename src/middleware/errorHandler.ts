import { Request, Response, NextFunction } from 'express';
import { ErrorResponse } from '../types/error.types';

// Centralized error handler - catches all errors and formats them consistently
export const errorHandler = (
  err: Error & { status?: number },
  _req: Request,
  res: Response<ErrorResponse>,
  _next: NextFunction
): void => {
  const status = err.status || 500;
  const message = err.message || 'Internal server error';

  // Log errors for debugging, but don't expose internal details to client
  if (status === 500) {
    console.error('Server error:', err);
  }

  res.status(status).json({
    message,
    status
  });
};

// Handle 404 for undefined routes
export const notFoundHandler = (
  req: Request,
  res: Response<ErrorResponse>
): void => {
  res.status(404).json({
    message: `Route ${req.originalUrl} not found`,
    status: 404
  });
};
