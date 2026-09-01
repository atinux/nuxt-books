import { createClient } from '@libsql/client';
import { drizzle } from 'drizzle-orm/libsql';
import type { Client } from '@libsql/client';

const databaseUrl = process.env.TURSO_DATABASE_URL;
const authToken = process.env.TURSO_AUTH_TOKEN || undefined;

const client = databaseUrl ? createClient({ authToken, url: databaseUrl }) : null;
export const db = client ? drizzle({ client }) : null;
export type SqlClient = Client;

export function requireDatabaseUrl() {
  if (!databaseUrl) throw new Error('TURSO_DATABASE_URL environment variable is not set');
  return databaseUrl;
}

export function requireSql() {
  if (!client) throw new Error('TURSO_DATABASE_URL environment variable is not set');
  return client;
}

export function requireDb() {
  if (!db) throw new Error('TURSO_DATABASE_URL environment variable is not set');
  return db;
}
