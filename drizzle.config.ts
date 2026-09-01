import './server/lib/db/load-env';
import type { Config } from 'drizzle-kit';

export default {
  dbCredentials: {
    authToken: process.env.TURSO_AUTH_TOKEN,
    url: process.env.TURSO_DATABASE_URL!,
  },
  dialect: 'turso',
  out: './server/lib/db/migrations',
  schema: './server/lib/db/schema.ts',
} satisfies Config;
