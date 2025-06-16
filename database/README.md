# Standalone Database Setup

This folder contains a standalone PostgreSQL database setup with automatic seeding.

## Structure

```
database/
├── docker-compose.yml    # Docker Compose configuration
├── .env                  # Environment variables (create this)
├── package.json          # Node.js dependencies for seeding
├── tsconfig.json         # TypeScript configuration
├── src/
│   ├── service/
│   │   └── db.ts         # Database connection utilities
│   └── db/
│       └── init/
│           └── seed.ts   # Database seeding script
└── init/
    └── 01-init.sql       # Database schema initialization
```

## Setup

1. **Create the `.env` file:**

   ```env
   POSTGRES_USER=myuser
   POSTGRES_PASSWORD=mypassword
   POSTGRES_DB=yeet
   ```

2. **Start the database with seeding:**

   ```bash
   docker-compose up -d
   ```

   This will:

   - Start PostgreSQL on port 5432
   - Create the database schema
   - Seed the database with 50 fake users and 200 transactions

3. **Verify the setup:**

   ```bash
   # Check if database is running
   docker ps

   # Connect to database and check data
   docker exec -it wallet-postgres psql -U myuser -d yeet -c "SELECT COUNT(*) FROM users;"
   ```

## Usage

### For Development

- Run this database setup independently
- Connect your backend to `localhost:5432`
- Database will be ready with fake data

### For Production

- Remove the `seed` service from docker-compose.yml
- Use proper database credentials
- Run migrations instead of seeding

## Database Schema

### Users Table

- `id`: UUID primary key
- `username`: Unique username
- `email`: Unique email
- `password`: Hashed password (default: 'hashedpassword123')
- `balance`: Decimal balance with 2 decimal places
- `created_at`: Timestamp

### Transactions Table

- `id`: UUID primary key
- `user_id`: Foreign key to users table
- `type`: 'credit' or 'debit'
- `amount`: Decimal amount
- `description`: Transaction description
- `created_at`: Timestamp

## Connecting from Backend

Update your backend's `.env` file:

```env
DATABASE_URL=postgresql://myuser:mypassword@localhost:5432/yeet
```

## Commands

```bash
# Start database with seeding
docker-compose up -d

# Start database only (no seeding)
docker-compose up -d postgres

# Stop database
docker-compose down

# Stop database and remove volumes
docker-compose down -v

# View logs
docker-compose logs -f

# Run seed manually (if database is already running)
pnpm seed
```
