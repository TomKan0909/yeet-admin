# ---- Base Stage ----
# Common setup for both builder and production stages
FROM node:20-alpine AS base

# Install pnpm globally (only once)
RUN npm install -g pnpm

# Set the working directory (only once)
WORKDIR /app

# Install postgresql-client for database connectivity
RUN apk add --no-cache postgresql-client

# ---- Builder Stage ----
FROM base AS builder

# Copy package.json and pnpm-lock.yaml first to leverage Docker's caching
COPY package.json pnpm-lock.yaml ./

# Install all dependencies, including devDependencies needed for the build
RUN pnpm install --frozen-lockfile

# Copy the rest of your application's source code
COPY . .

# Compile TypeScript into JavaScript
RUN pnpm run build

# ---- Production Stage ----
FROM base AS production

# Copy package.json and pnpm-lock.yaml again
COPY package.json pnpm-lock.yaml ./

# Install only production dependencies
RUN pnpm install --frozen-lockfile --prod

# Copy the compiled code from the 'builder' stage
COPY --from=builder /app/dist ./dist

# Expose the port the application runs on
EXPOSE 3001

# Start the application using the start script from package.json
CMD ["pnpm", "start"]