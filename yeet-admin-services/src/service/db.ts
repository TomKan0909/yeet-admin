/**
 *Function: This is one of the most critical files. Its sole purpose is to configure and export the connection
 *to your PostgreSQL database. It uses the pg library and the connection string from your config to create a
 *connection Pool. A pool is essential for performance as it manages a set of active database connections that
 *can be reused by multiple requests. Your data models (user.model.ts, transaction.model.ts) will import the
 *pool from this file to run their queries. This centralizes all database connection logic into one place.
 *
 */
import { Pool } from 'pg';
import dotenv from 'dotenv';
import config from '../config';

dotenv.config();

// Create a new connection pool instance.
// The pool is a highly efficient way to manage multiple client connections
// to the database, which is essential for a web server handling concurrent requests.
const pool = new Pool({
  user: config.postgresUser,
  host: config.postgresHost,
  database: config.postgresDb,
  password: config.postgresPassword,
  port: config.postgresPort,
});

// It's a good practice to listen for connection errors on the pool.
// This helps in debugging issues if the backend can't reach the database.
pool.on('error', (err, client) => {
  console.error('Unexpected error on idle client', err);
  process.exit(-1);
});

// We export a single query function that abstracts away the need to manually
// check out a client from the pool for every query. This simplifies our model files.
// The pool.query() method automatically handles acquiring and releasing a client.
export const query = async <T>(text: string, params?: any[]): Promise<T> => {
  const maxRetries = 3;
  const baseDelay = 1000; // Start with 1 second delay

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const result = await pool.query(text, params);
      return result.rows as T;
    } catch (error) {
      if (attempt === maxRetries) throw error;

      // Calculate delay with exponential backoff and jitter
      const exponentialDelay = baseDelay * Math.pow(2, attempt - 1);
      const jitter = Math.random() * exponentialDelay * 0.1; // 10% jitter
      const totalDelay = exponentialDelay + jitter;

      console.warn(
        `Database query attempt ${attempt} failed, retrying in ${Math.round(totalDelay)}ms`
      );
      await new Promise((resolve) => setTimeout(resolve, totalDelay));
    }
  }
  throw new Error('Query failed after max retries');
};

interface PostgresError extends Error {
  code?: string;
}

/**
 * Executes multiple queries in a single transaction with retry logic.
 * If any query fails, the entire transaction is rolled back and retried.
 * @param callback A function that receives a client and executes queries
 * @returns The result of the last query in the transaction
 */
export const transaction = async <T>(callback: (client: any) => Promise<T>): Promise<T> => {
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
        `Transaction attempt ${attempt} failed, retrying in ${Math.round(totalDelay)}ms. Error: ${pgError.message}`
      );
      await new Promise((resolve) => setTimeout(resolve, totalDelay));
    } finally {
      client.release();
    }
  }
  throw new Error('Transaction failed after all retry attempts');
};

console.log('Database connection pool created.');
