import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';

const connectionString = process.env.DATABASE_URL ?? process.env.POSTGRES_URL;

const pool = connectionString ? new Pool({ connectionString }) : null;
export const db = pool ? drizzle({ client: pool }) : null;

export type SqlExecutor = {
  query: (text: string, values?: unknown[]) => Promise<unknown>;
};

export type SqlClient = SqlExecutor & {
  transaction: <T>(callback: (client: SqlExecutor) => Promise<T>) => Promise<T>;
};

function createSqlClient(clientPool: Pool): SqlClient {
  return {
    query: (text, values) => clientPool.query(text, values),
    async transaction(callback) {
      const client = await clientPool.connect();

      try {
        await client.query('BEGIN');
        const result = await callback({ query: (text, values) => client.query(text, values) });
        await client.query('COMMIT');
        return result;
      } catch (error) {
        await client.query('ROLLBACK');
        throw error;
      } finally {
        client.release();
      }
    },
  };
}

const sql = pool ? createSqlClient(pool) : null;

export function requireSql() {
  if (!sql) throw new Error('DATABASE_URL environment variable is not set');
  return sql;
}

export function requireDb() {
  if (!db) throw new Error('DATABASE_URL environment variable is not set');
  return db;
}
