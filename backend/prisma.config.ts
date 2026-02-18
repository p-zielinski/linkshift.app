import { defineConfig } from 'prisma/config';
import { readFileSync } from 'fs';
import 'dotenv/config';

/**
 * Helper to get database URL from environment variables or Docker Secrets.
 * Returns undefined instead of null to satisfy Prisma's type requirements.
 */
const getDatabaseUrl = (): string | undefined => {
  // 1. Try to get from standard environment variable
  if (process.env.DATABASE_URL) {
    return process.env.DATABASE_URL;
  }

  // 2. Try to read from Docker Secret file
  try {
    // We use undefined as the fallback to match TS2322 requirements
    return readFileSync('/run/secrets/database_url', 'utf8').trim();
  } catch (err: unknown) {
    // Log error only in development or if needed for debugging
    // console.warn('Could not read database_url secret file');
    return undefined;
  }
};

const databaseUrl = getDatabaseUrl();

export default defineConfig({
  datasource: {
    url: databaseUrl,
  },
});
