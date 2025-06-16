/**
 *
 * Function: This is the single source of truth for all application configuration. It reads environment
 * variables from your .env file (using the dotenv library) and exports them in a clean, accessible
 * object. It is also responsible for setting default values for variables that might not be defined,
 * which prevents the application from crashing. For example, it would read DATABASE_URL and PORT from
 * .env but provide a default port like 3000 if one isn't specified. The rest of your app imports from
 * this file, not directly from process.env.
 */

// src/config/index.ts
import dotenv from 'dotenv';
dotenv.config();

const config = {
  port: process.env.PORT || 3001,
  postgresHost: process.env.POSTGRES_HOST || 'localhost',
  postgresUser: process.env.POSTGRES_USER || 'myuser',
  postgresPassword: process.env.POSTGRES_PASSWORD || 'mypassword',
  postgresPort: Number(process.env.POSTGRES_PORT) || 5432,
  postgresDb: process.env.POSTGRES_DB || 'yeet',
  // other configs can be commented out for now
};
export default config;
