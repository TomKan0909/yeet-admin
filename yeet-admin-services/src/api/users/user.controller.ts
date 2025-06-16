import { Request, Response, NextFunction } from 'express';
import { AdjustBalanceBody, AdjustBalanceParams, GetUsersQuery } from './user.validation';
import {
  getTotalUserCount,
  getUsersPaginated,
  updateUserBalanceWithTransaction,
} from './user.queries';

// Controller logic for getting all users
export const getAllUsers = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { page, limit, sortBy, sortOrder } = req.query as unknown as GetUsersQuery;

    const users = await getUsersPaginated(page, limit, sortBy, sortOrder);

    const totalUsers = await getTotalUserCount();

    res.status(200).json({ users, totalUsers });
  } catch (error) {
    next(error);
  }
};

// Controller logic for crediting a user
export const creditUserBalance = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { userId } = req.params as unknown as AdjustBalanceParams;
    const { amount, description } = req.body as unknown as AdjustBalanceBody;

    await updateUserBalanceWithTransaction(userId, amount, 'credit', description);
    res.status(200).json({ message: 'User credited successfully' });
  } catch (error: unknown) {
    if (error instanceof Error && error.message === 'User not found') {
      return res.status(404).json({ message: 'User not found' });
    }
    next(error);
  }
};

// Controller logic for debiting a user
export const debitUserBalance = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { userId } = req.params as unknown as AdjustBalanceParams;
    const { amount, description } = req.body as unknown as AdjustBalanceBody;

    await updateUserBalanceWithTransaction(userId, amount, 'debit', description);
    res.status(200).json({ message: 'User debited successfully' });
  } catch (error: unknown) {
    if (error instanceof Error) {
      if (error.message === 'User not found') {
        return res.status(404).json({ message: 'User not found' });
      }
      if (error.message === 'Insufficient balance or user not found') {
        return res.status(400).json({ message: 'Insufficient balance' });
      }
    }
    next(error);
  }
};
