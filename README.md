# Yeet Admin - Development Setup

A wallet management system built with Next.js, Express.js, and PostgreSQL.

## 🚀 Quick Start for Development

### Option 1: Start Everything with Docker Compose

```bash
# Clone the repository
git clone <repository-url>
cd yeet-admin

# Create environment file
echo "# **Database** configuration
POSTGRES_USER=myuser
POSTGRES_PASSWORD=mypassword
POSTGRES_DB=yeet
DATABASE_URL=postgresql://myuser:mypassword@postgres:5432/yeet" > .env

# Start all services (database, backend, frontend)
docker-compose up -d
```

This will start:

- **Database**: PostgreSQL on port 5432
- **Backend**: Express API on port 3001
- **Frontend**: Next.js app on port 3000

Access the application at: http://localhost:3000/users

### Option 2: Development Mode (Recommended)

#### 1. Start Database Only

```bash
# Navigate to database directory
cd database

# create env file look at env file below

# Start PostgreSQL with Docker
docker-compose up -d

# Verify database is running
docker ps
```

The database will be seeded with 50 users and 200 transactions automatically.

#### 2. Start Backend Server

```bash
# Navigate to backend directory
cd yeet-admin-services

# Install dependencies
pnpm install

# Create environment file look at env file needed below

# Start development server
pnpm dev
```

Backend will be available at: http://localhost:3001

#### 3. Start Frontend Server

```bash
# Open new terminal and navigate to frontend directory
cd applications/yeet-admin

# Install dependencies
pnpm install

# Create env file look at env file below

# Start development server
pnpm dev
```

Frontend will be available at: http://localhost:3000

## 🔧 Environment Variables

### Root Directory (.env)

```env
POSTGRES_USER=myuser
POSTGRES_PASSWORD=mypassword
POSTGRES_DB=yeet
DATABASE_URL=postgresql://myuser:mypassword@postgres:5432/yeet
```

### Backend (.env in yeet-admin-services/)

```env
# Application Port
PORT=3001
DATABASE_URL=postgresql://myuser:mypassword@localhost:5432/yeet
POSTGRES_HOST=localhost
POSTGRES_USER=myuser
POSTGRES_PASSWORD=mypassword
POSTGRES_DB=yeet
POSTGRES_PORT=5432
```

### Frontend (.env.local in applications/yeet-admin)

```env
NEXT_PUBLIC_API_URL=http://localhost:3001
```

## Schema design

### Database Tables

#### Users Table

```sql
CREATE TABLE "users" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "username" VARCHAR(50) UNIQUE NOT NULL,
    "email" VARCHAR(255) UNIQUE NOT NULL,
    "balance" DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT "balance_non_negative" CHECK ("balance" >= 0)
);
```

**Fields:**

- `id`: Unique identifier (UUID, auto-generated)
- `username`: Unique username (max 50 characters)
- `email`: Unique email address (max 255 characters)
- `balance`: Current wallet balance (decimal with 2 places, non-negative)
- `created_at`: Account creation timestamp

**Constraints:**

- Balance cannot be negative
- Username and email must be unique

#### Transactions Table

```sql
CREATE TYPE "transaction_type" AS ENUM ('credit', 'debit');

CREATE TABLE "transactions" (
    "id" SERIAL PRIMARY KEY,
    "user_id" UUID NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
    "type" "transaction_type" NOT NULL,
    "amount" DECIMAL(12, 2) NOT NULL,
    "description" VARCHAR(255),
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT "amount_positive" CHECK ("amount" > 0)
);
```

**Fields:**

- `id`: Auto-incrementing primary key
- `user_id`: Foreign key to users table (cascades on delete)
- `type`: Transaction type ('credit' or 'debit')
- `amount`: Transaction amount (always positive)
- `description`: Optional transaction description
- `created_at`: Transaction timestamp

**Constraints:**

- Amount must be positive
- User_id must reference existing user

### Sample Data

The database is seeded with:

- **50 users** with random usernames, emails, and balances ($0 - $10,000)
- **200 transactions** with random amounts ($1 - $1,000) and descriptions

### Indexes

```sql
CREATE INDEX "idx_transactions_user_id" ON "transactions"("user_id");
CREATE INDEX "idx_users_username" ON "users"("username");
```

### Relationships

- **One-to-Many**: One user can have many transactions
- **Cascade Delete**: Deleting a user removes all their transactions
- **Referential Integrity**: All transactions must reference valid users

### Considerations

- Considered adding an idempotency key to transactions to prevent duplicate processing of the same transaction
  - client will generate the uuid of the transaction. This will fix issues of js where a button click accidentally send out two network requests
- Considered adding a status field (e.g. 'pending', 'approved') to handle multi-step transactions like bank deposits
- Future consideration: Adding user tags for segmentation (e.g. 'VIP', 'low_stakes') - not required for current scope
