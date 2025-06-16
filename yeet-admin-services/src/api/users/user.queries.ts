import { query, transaction } from '../../service/db';
import { User } from '../../types/user';

export const getUsersPaginated = async (
  page: number,
  limit: number,
  sortBy: 'username' | 'email' | 'created_at' | 'balance',
  sortOrder: 'asc' | 'desc'
) => {
  // Validate sortOrder
  const validSortOrder = sortOrder.toUpperCase() === 'DESC' ? 'DESC' : 'ASC';

  return await query<User[]>(
    `
    SELECT * FROM users 
    ORDER BY ${sortBy} ${validSortOrder}
    LIMIT $1::integer OFFSET $2::integer
    `,
    [limit, (page - 1) * limit]
  );
};

export const getTotalUserCount = async (): Promise<number> => {
  const result = await query<{ count: number }[]>(`SELECT COUNT(*) FROM users`);
  return result[0].count;
};

export const updateUserBalanceWithTransaction = async (
  userId: string,
  amount: number,
  type: 'credit' | 'debit',
  description?: string
): Promise<number> => {
  return await transaction(async (client) => {
    let updateResult;

    if (type === 'credit') {
      // For credits, simply add to the balance
      updateResult = await client.query(
        `UPDATE users 
           SET balance = balance + $1 
           WHERE id = $2 
           RETURNING balance`,
        [amount, userId]
      );
    } else {
      // For debits, ensure sufficient balance
      updateResult = await client.query(
        `UPDATE users 
           SET balance = balance - $1 
           WHERE id = $2 
           AND balance >= $1
           RETURNING balance`,
        [amount, userId]
      );
    }

    // Check if any rows were updated
    if (updateResult.rows.length === 0) {
      // First check if user exists
      const userExists = await client.query('SELECT 1 FROM users WHERE id = $1', [userId]);

      if (userExists.rows.length === 0) {
        throw new Error('User not found');
      }

      // If we get here, user exists but debit failed due to insufficient balance
      if (type === 'debit') {
        throw new Error('Insufficient balance');
      }
    }

    // Record the transaction
    await client.query(
      `INSERT INTO transactions (user_id, type, amount, description) 
       VALUES ($1, $2, $3, $4)`,
      [userId, type, amount, description]
    );

    return updateResult.rows[0].balance;
  });
};
