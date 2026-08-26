import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import dotenv from "dotenv";

dotenv.config();

const connectionString = process.env.POSTGRES_URL;

export const sql = connectionString ? neon(connectionString) : null;
export const db = sql ? drizzle(sql) : null;

export function requireSql() {
  if (!sql) throw new Error("POSTGRES_URL environment variable is not set");
  return sql;
}

export function requireDb() {
  if (!db) throw new Error("POSTGRES_URL environment variable is not set");
  return db;
}
