import { Request, Response, NextFunction } from 'express';
import { ErrorResponse } from '../types/error.types';

/**
 * Centralized error handler | Zentralisierter Fehlerhandler
 * 
 * EN: Catches all errors from controllers and middleware, formats them consistently.
 *     Returns standardized error response with message and status code.
 *     Logs 500-level errors for debugging without exposing internal details.
 * 
 * DE: Fängt alle Fehler von Controllern und Middleware ab, formatiert sie einheitlich.
 *     Gibt standardisierte Fehlerantwort mit Nachricht und Statuscode zurück.
 *     Protokolliert 500-Level-Fehler zum Debuggen ohne interne Details preiszugeben.
 */
export const errorHandler = (
  err: Error & { status?: number },
  _req: Request,
  res: Response<ErrorResponse>,
  _next: NextFunction
): void => {
  const status = err.status || 500;
  const message = err.message || 'Internal server error';

  if (status === 500) {
    console.error('Server error:', err);
  }

  res.status(status).json({
    message,
    status
  });
};

/**
 * Handle 404 for undefined routes | 404-Handler für undefinierte Routen
 * 
 * EN: Catches requests to non-existent endpoints and returns 404 error.
 * DE: Fängt Anfragen an nicht existierende Endpunkte ab und gibt 404-Fehler zurück.
 */
export const notFoundHandler = (
  req: Request,
  res: Response<ErrorResponse>
): void => {
  res.status(404).json({
    message: `Route ${req.originalUrl} not found`,
    status: 404
  });
};
