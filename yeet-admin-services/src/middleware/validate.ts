/** 
 * 
 * 
 * Function: This file contains a reusable, higher-order function that takes a Zod schema and returns an Express
 * middleware. Its job is to act as a "gatekeeper" for your routes. Before any request hits your controller's 
 * logic, this middleware intercepts it and validates the body, params, or query against the provided schema. If
 * the data is invalid, it immediately sends back a 400 Bad Request error. If the data is valid, it passes the
 * request along to the next step.

*/

import { Request, Response, NextFunction } from 'express';
import { AnyZodObject, ZodError } from 'zod';

/**
 * Creates a middleware that validates request data against a Zod schema
 * @param schema - The Zod schema to validate against
 * @param targets - Which part of the request to validate ('body', 'params', or 'query')
 */
export const validate = (
  schema: AnyZodObject,
  targets: ('body' | 'params' | 'query')[] = ['body']
) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Validate the specified part of the request against the schema
      for (const target of targets) {
        await schema.shape[target].parseAsync(req[target]);
      }
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        // Format Zod validation errors into a clean response
        const formattedErrors = error.errors.map((err) => ({
          path: err.path.join('.'),
          message: err.message,
        }));

        return res.status(400).json({
          status: 'error',
          message: 'Validation failed',
          errors: formattedErrors,
        });
      }

      // Handle unexpected errors
      return res.status(500).json({
        status: 'error',
        message: 'Internal server error during validation',
      });
    }
  };
};
