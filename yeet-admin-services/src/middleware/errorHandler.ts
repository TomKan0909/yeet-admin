/**
 * Function: This file defines a special "catch-all" error-handling middleware for your entire application. It's
 * the final stop for any errors that occur during a request, especially in your async controllers. Its primary
 * job is to prevent the server from crashing, log the technical error details for developers to see, and send
 * a generic, user-friendly error message (like "500 Internal Server Error") back to the client, hiding the
 * sensitive implementation details of the error.
 */

import { Request, Response, NextFunction } from 'express';

interface CustomError extends Error {
  statusCode?: number;
  status?: string;
}

export const errorHandler = async (
  err: CustomError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // Set default values if not provided
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  // Log error details for developers
  console.error('Error 💥:', {
    status: err.status,
    statusCode: err.statusCode,
    message: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
    timestamp: new Date().toISOString(),
  });

  // Send response to client
  res.status(err.statusCode).json({
    status: err.status,
    message: err.message || 'Something went wrong!',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};
