import './load-env';
import path from 'path';
import { migrate } from 'drizzle-orm/node-postgres/migrator';

import { requireDb } from './drizzle';

async function main() {
  await migrate(requireDb(), {
    migrationsFolder: path.join(__dirname, './migrations'),
  });
  console.log('Migrations complete');
}

main();
