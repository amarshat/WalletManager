import { Request, Response, NextFunction } from 'express';
import { storage } from '../storage';

// Error levels
export type ErrorLevel = 'info' | 'warning' | 'error' | 'critical';

// Error sources
export type ErrorSource = 'client' | 'server' | 'api';

// Error context
export interface ErrorContext {
  component?: string;
  source?: ErrorSource;
  level?: ErrorLevel;
  userId?: number;
  details?: Record<string, any>;
  stackTrace?: string;
  url?: string;
}

// Format error for logging
export function formatError(err: Error, context: ErrorContext = {}): Record<string, any> {
  return {
    message: err.message,
    stackTrace: err.stack,
    ...context
  };
}

// Catch-all error handler middleware
export function errorHandler(err: Error, req: Request, res: Response, next: NextFunction) {
  const userId = req.user?.id;
  const url = req.originalUrl;
  const method = req.method;
  
  // Default error context
  const errorContext: ErrorContext = {
    component: 'api',
    source: 'server',
    level: 'error',
    userId,
    url,
    details: {
      method,
      path: url,
      query: req.query,
      body: sanitizeRequestBody(req.body)
    }
  };
  
  // Determine error level based on status code or error type
  if (err.name === 'ValidationError') {
    errorContext.level = 'warning';
  } else if (err.name === 'AuthenticationError' || err.name === 'AuthorizationError') {
    errorContext.level = 'warning';
  } else if (err.name === 'SyntaxError') {
    errorContext.level = 'warning';
  } else if (err.name === 'DatabaseError' || err.name === 'SequelizeError') {
    errorContext.level = 'critical';
    errorContext.component = 'database';
  }
  
  // Log error to system logs
  storage.addSystemLog({
    userId,
    action: `Error: ${err.message}`,
    details: formatError(err, errorContext)
  }).catch(logError => {
    console.error('Error logging to database failed:', logError);
  });
  
  // Send appropriate response
  const statusCode = getErrorStatusCode(err);
  
  // Create user-friendly error message
  const userMessage = getUserFriendlyErrorMessage(err, statusCode);
  
  res.status(statusCode).json({
    error: {
      message: userMessage,
      code: err.name,
      id: Date.now().toString()
    }
  });
}

// Client-side error logging endpoint
export async function logClientError(req: Request, res: Response) {
  try {
    const { 
      message, 
      stackTrace, 
      component, 
      level = 'error',
      details,
      url
    } = req.body;
    
    if (!message) {
      return res.status(400).json({ error: 'Error message is required' });
    }
    
    // Create error context
    const errorContext: ErrorContext = {
      component: component || 'client',
      source: 'client',
      level: level as ErrorLevel,
      userId: req.user?.id,
      stackTrace,
      url,
      details
    };
    
    // Log to system logs
    await storage.addSystemLog({
      userId: req.user?.id,
      action: `Client Error: ${message}`,
      details: errorContext
    });
    
    res.json({ success: true });
  } catch (error: any) {
    console.error('Error logging client-side error:', error);
    res.status(500).json({ error: 'Failed to log error' });
  }
}

// Get error status code
function getErrorStatusCode(err: Error): number {
  if (err.name === 'ValidationError') return 400;
  if (err.name === 'AuthenticationError') return 401;
  if (err.name === 'AuthorizationError') return 403;
  if (err.name === 'NotFoundError') return 404;
  if (err.name === 'ConflictError') return 409;
  if (err.name === 'RateLimitError') return 429;
  
  // Default to 500 for server errors
  return 500;
}

// Create user-friendly error messages
function getUserFriendlyErrorMessage(err: Error, statusCode: number): string {
  // For validation errors, return the original message
  if (statusCode === 400) {
    return err.message;
  }
  
  // For authentication errors
  if (statusCode === 401) {
    return 'Authentication required. Please sign in to continue.';
  }
  
  // For authorization errors
  if (statusCode === 403) {
    return 'You don\'t have permission to perform this action.';
  }
  
  // For not found errors
  if (statusCode === 404) {
    return 'The requested resource was not found.';
  }
  
  // For conflict errors
  if (statusCode === 409) {
    return 'This operation couldn\'t be completed due to a conflict with current state.';
  }
  
  // For rate limit errors
  if (statusCode === 429) {
    return 'Too many requests. Please try again later.';
  }
  
  // For server errors, provide a generic message
  return 'An unexpected error occurred. Our team has been notified.';
}

// Sanitize request body to remove sensitive data
function sanitizeRequestBody(body: any): any {
  if (!body) return body;
  
  const sensitiveFields = ['password', 'confirmPassword', 'secret', 'token', 'apiKey', 'creditCard'];
  const sanitized = { ...body };
  
  // Recursively sanitize nested objects
  for (const key in sanitized) {
    if (sensitiveFields.includes(key)) {
      sanitized[key] = '[REDACTED]';
    } else if (typeof sanitized[key] === 'object' && sanitized[key] !== null) {
      sanitized[key] = sanitizeRequestBody(sanitized[key]);
    }
  }
  
  return sanitized;
}

// Create custom error types
export class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ValidationError';
  }
}

export class AuthenticationError extends Error {
  constructor(message = 'Authentication required') {
    super(message);
    this.name = 'AuthenticationError';
  }
}

export class AuthorizationError extends Error {
  constructor(message = 'Permission denied') {
    super(message);
    this.name = 'AuthorizationError';
  }
}

export class NotFoundError extends Error {
  constructor(message = 'Resource not found') {
    super(message);
    this.name = 'NotFoundError';
  }
}

export class ConflictError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ConflictError';
  }
}

export class RateLimitError extends Error {
  constructor(message = 'Rate limit exceeded') {
    super(message);
    this.name = 'RateLimitError';
  }
}

export class DatabaseError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'DatabaseError';
  }
}