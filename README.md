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
