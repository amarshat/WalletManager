import { Request, Response, NextFunction } from 'express';
import { db } from '../db';
import { systemLogs } from '@shared/schema';

export type ErrorLevel = 'info' | 'warning' | 'error' | 'critical';
export type ErrorSource = 'client' | 'server' | 'api';

export interface ErrorContext {
  component?: string;
  source?: ErrorSource;
  level?: ErrorLevel;
  userId?: number;
  details?: Record<string, any>;
  stackTrace?: string;
  url?: string;
}

/**
 * Format error data into a structured object for consistent error logging
 */
export function formatError(err: Error, context: ErrorContext = {}): Record<string, any> {
  return {
    message: err.message,
    name: err.name,
    level: context.level || 'error',
    source: context.source || 'server',
    component: context.component || 'unknown',
    userId: context.userId,
    details: context.details || {},
    stackTrace: context.stackTrace || err.stack,
    timestamp: new Date(),
    url: context.url
  };
}

/**
 * Global error handler middleware
 */
export function errorHandler(err: Error, req: Request, res: Response, next: NextFunction) {
  // Skip to next error handler if headers already sent
  if (res.headersSent) {
    return next(err);
  }

  // Get error details
  const statusCode = getErrorStatusCode(err);
  const errorMessage = getUserFriendlyErrorMessage(err, statusCode);
  
  // Prepare error context
  const errorContext: ErrorContext = {
    source: 'server',
    level: statusCode >= 500 ? 'error' : 'warning',
    userId: req.user?.id,
    details: {
      method: req.method,
      path: req.path,
      statusCode,
      body: sanitizeRequestBody(req.body)
    },
    url: req.originalUrl
  };

  // Log error to database
  const formattedError = formatError(err, errorContext);
  
  try {
    // Log to database
    db.insert(systemLogs).values({
      action: 'ERROR', // Use action field instead of type
      details: formattedError,
      userId: req.user?.id,
      level: 'error',
      source: errorContext.source || 'server',
      component: errorContext.component || 'unknown',
      statusCode: statusCode,
      createdAt: new Date()
    }).execute();
  } catch (dbError) {
    console.error('Failed to log error to database:', dbError);
  }

  // Log to console in development
  console.error('Error:', formattedError);

  // Send error response
  res.status(statusCode).json({
    error: errorMessage,
    code: err.name,
    requestId: req.headers['x-request-id'] || null
  });
}

/**
 * API route for client-side error logging
 */
export async function logClientError(req: Request, res: Response) {
  try {
    const { message, name, stack, componentStack, details, level, url } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'Error message is required' });
    }

    // Create error from client data
    const error = new Error(message);
    error.name = name || 'ClientError';
    
    // Prepare error context
    const errorContext: ErrorContext = {
      source: 'client',
      level: level || 'error',
      userId: req.user?.id,
      stackTrace: stack,
      details: {
        ...details,
        componentStack,
        userAgent: req.headers['user-agent']
      },
      url: url || req.headers.referer
    };

    // Log error to database
    const formattedError = formatError(error, errorContext);
    
    await db.insert(systemLogs).values({
      action: 'CLIENT_ERROR',
      details: formattedError,
      source: 'client',
      level: level || 'error',
      component: details?.component || 'unknown',
      userId: req.user?.id,
      createdAt: new Date()
    }).execute();

    res.status(200).json({ success: true });
  } catch (err) {
    console.error('Failed to log client error:', err);
    res.status(500).json({ error: 'Failed to log error' });
  }
}

/**
 * Helper function to get appropriate HTTP status code for an error
 */
function getErrorStatusCode(err: Error): number {
  switch (err.constructor.name) {
    case 'ValidationError':
      return 400;
    case 'AuthenticationError':
      return 401;
    case 'AuthorizationError':
      return 403;
    case 'NotFoundError':
      return 404;
    case 'ConflictError':
      return 409;
    case 'RateLimitError':
      return 429;
    case 'DatabaseError':
      return 500;
    default:
      // Certain error messages can indicate specific status codes
      if (err.message.includes('not found') || err.message.includes('does not exist')) {
        return 404;
      }
      if (err.message.includes('unauthorized') || err.message.includes('not authenticated')) {
        return 401;
      }
      if (err.message.includes('permission') || err.message.includes('not allowed')) {
        return 403;
      }
      return 500;
  }
}

/**
 * Helper function to get user-friendly error messages
 */
function getUserFriendlyErrorMessage(err: Error, statusCode: number): string {
  // Return original message for client errors (4xx)
  if (statusCode < 500) {
    return err.message;
  }
  
  // For server errors, provide a generic message
  return 'An unexpected error occurred. Our technical team has been notified.';
}

/**
 * Helper function to sanitize request body for logging (remove sensitive data)
 */
function sanitizeRequestBody(body: any): any {
  if (!body) return null;
  
  const sanitized = { ...body };
  
  // List of sensitive fields to redact
  const sensitiveFields = [
    'password', 'token', 'secret', 'key', 'authorization', 
    'auth', 'apiKey', 'api_key', 'credentials', 'card'
  ];
  
  // Redact sensitive fields
  Object.keys(sanitized).forEach(key => {
    if (sensitiveFields.some(field => key.toLowerCase().includes(field.toLowerCase()))) {
      sanitized[key] = '[REDACTED]';
    }
  });
  
  return sanitized;
}

// Custom error classes
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