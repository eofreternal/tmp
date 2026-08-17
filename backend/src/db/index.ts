import { drizzle } from 'drizzle-orm/better-sqlite3';

const db = drizzle("database.db");

export { db }