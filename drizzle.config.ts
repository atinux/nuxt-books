import './server/lib/db/load-env';
import type { Config } from 'drizzle-kit';

export default {
  dbCredentials: {
    url: (process.env.DATABASE_URL ?? process.env.POSTGRES_URL)!,
  },
  dialect: 'postgresql',
  out: './server/lib/db/migrations',
  schema: './server/lib/db/schema.ts',
} satisfies Config;
