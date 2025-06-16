import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const pool = new Pool({
  user: process.env.POSTGRES_USER,
  host: 'postgres',
  database: process.env.POSTGRES_DB,
  password: process.env.POSTGRES_PASSWORD,
  port: 5432,
});

// It's a good practice to listen for connection errors on the pool.
// This helps in debugging issues if the backend can't reach the database.
pool.on('error', (err, client) => {
  console.error('Unexpected error on idle client', err);
  process.exit(-1);
});

interface PostgresError extends Error {
  code?: string;
}

export const transaction = async <T>(
  callback: (client: any) => Promise<T>
): Promise<T> => {
  const maxRetries = 3;
  const baseDelay = 1000; // Start with 1 second delay

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      const result = await callback(client);
      await client.query('COMMIT');
      return result;
    } catch (error) {
      await client.query('ROLLBACK');

      const pgError = error as PostgresError;

      // Don't retry on certain errors that won't be resolved by retrying
      if (
        pgError.code === '23505' || // unique_violation
        pgError.code === '23503' || // foreign_key_violation
        pgError.code === '22P02' || // invalid_text_representation
        pgError.code === '42703' // undefined_column
      ) {
        throw error;
      }

      if (attempt === maxRetries) {
        throw error;
      }

      // Calculate delay with exponential backoff and jitter
      const exponentialDelay = baseDelay * Math.pow(2, attempt - 1);
      const jitter = Math.random() * exponentialDelay * 0.1; // 10% jitter
      const totalDelay = exponentialDelay + jitter;

      console.warn(
        `Transaction attempt ${attempt} failed, retrying in ${Math.round(
          totalDelay
        )}ms. Error: ${pgError.message}`
      );
      await new Promise((resolve) => setTimeout(resolve, totalDelay));
    } finally {
      client.release();
    }
  }
  throw new Error('Transaction failed after all retry attempts');
};
