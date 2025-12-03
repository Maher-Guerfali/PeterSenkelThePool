// Custom error class to maintain consistent error responses
export class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.status = status;
    this.name = 'ApiError';
    
    // Maintains proper stack trace for debugging
    Error.captureStackTrace(this, this.constructor);
  }
}

// Standard error response shape
export interface ErrorResponse {
  message: string;
  status: number;
}
