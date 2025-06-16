/**
 *  The "security guard." It defines the validation rules using Zod to ensure that data
 * sent to the API is in the correct format before the controller processes it.
 */

import { z } from 'zod';

// Schema for GET /api/users
export const getUsersSchema = z.object({
  query: z.object({
    page: z.coerce.number().int().positive().optional().default(1),
    limit: z.coerce.number().int().positive().optional().default(10),
    sortBy: z.enum(['username', 'email', 'balance', 'created_at']).optional().default('created_at'),
    sortOrder: z.enum(['asc', 'desc']).optional().default('desc'),
  }),
});

// Schema for POST /api/users/:userId/credit and POST /api/users/:userId/debit
export const adjustBalanceSchema = z.object({
  params: z.object({
    userId: z.coerce.string().uuid(),
  }),
  body: z.object({
    amount: z.coerce.number().positive('Amount must be a positive number.'),
    description: z.string().min(5, 'Description is required').optional(),
  }),
});

// Infer the TypeScript type from the Zod schema
export type GetUsersQuery = z.infer<typeof getUsersSchema>['query'];
export type AdjustBalanceParams = z.infer<typeof adjustBalanceSchema>['params'];
export type AdjustBalanceBody = z.infer<typeof adjustBalanceSchema>['body'];
