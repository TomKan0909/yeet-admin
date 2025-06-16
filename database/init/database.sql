-- Disable notices to keep the output clean during execution.
SET client_min_messages TO WARNING;

-- We'll wrap our schema creation in a transaction to ensure it either
-- completes fully or not at all.
BEGIN;

-- First, drop existing objects if they exist to ensure a clean slate.
-- This is useful for development when you might rerun the script.
DROP TABLE IF EXISTS "transactions";
DROP TABLE IF EXISTS "users";
DROP TYPE IF EXISTS "transaction_type";

-- Create a custom ENUM type for transaction types.
-- This is more robust than using a simple string, as it enforces that
-- only 'credit' or 'debit' can be used.
CREATE TYPE "transaction_type" AS ENUM ('credit', 'debit');

-- Create the "users" table.
-- This table stores user information and their current balance.
CREATE TABLE "users" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "username" VARCHAR(50) UNIQUE NOT NULL,
    "email" VARCHAR(255) UNIQUE NOT NULL,
    
    -- Using DECIMAL for financial values is best practice to avoid floating point inaccuracies.
    -- (12, 2) allows for balances up to 9,999,999,999.99
    "balance" DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    
    -- This database-level constraint is crucial. It provides a hard guarantee
    -- that a user's balance can never be negative, protecting against bugs.
    CONSTRAINT "balance_non_negative" CHECK ("balance" >= 0),
    
    -- Use TIMESTAMPTZ (timestamp with time zone) for all timestamps.
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create the "transactions" table.
-- This table serves as a ledger, recording every financial event that occurs.
CREATE TABLE "transactions" (
    "id"SERIAL PRIMARY KEY,
    
    -- This sets up a one-to-many relationship with the "users" table.
    -- ON DELETE CASCADE means if a user is deleted, all their associated transactions
    -- will be automatically deleted as well, maintaining data integrity.
    "user_id" UUID NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
    
    "type" "transaction_type" NOT NULL,
    
    -- The amount is always stored as a positive number. The "type" column
    -- determines whether it was added to or subtracted from the user's balance.
    "amount" DECIMAL(12, 2) NOT NULL,
    CONSTRAINT "amount_positive" CHECK ("amount" > 0),
    
    -- An optional field for admins to add notes for manual adjustments.
    "description" VARCHAR(255),
    
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes on frequently queried columns to improve performance.
-- An index on the foreign key is almost always a good idea.
CREATE INDEX "idx_transactions_user_id" ON "transactions"("user_id");
-- An index on username will speed up sorting by that column.
CREATE INDEX "idx_users_username" ON "users"("username");

-- Add comments on the tables and columns for documentation purposes.
COMMENT ON TABLE "users" IS 'Stores user accounts and their wallet balance.';
COMMENT ON TABLE "transactions" IS 'A ledger of all credit and debit operations for users.';
COMMENT ON COLUMN "transactions"."amount" IS 'The value of the transaction, always stored as a positive number.';


-- Commit the transaction to make all the changes permanent.
COMMIT;




