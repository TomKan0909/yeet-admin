import { Router } from 'express';
import { getAllUsers, creditUserBalance, debitUserBalance } from './user.controller';
import { getUsersSchema, adjustBalanceSchema } from './user.validation';
import { validate } from '../../middleware/validate';
const router = Router();

// Route to add funds to a specific user's account
router.post(
  '/:userId/credit',
  validate(adjustBalanceSchema, ['params', 'body']),
  creditUserBalance
);

// Route to debit funds from a specific user's account
router.post('/:userId/debit', validate(adjustBalanceSchema, ['params', 'body']), debitUserBalance);

// Route to get all users paginated
router.get('/users', validate(getUsersSchema, ['query']), getAllUsers);

export default router;
