import { drizzle } from "drizzle-orm/expo-sqlite";
import { openDatabaseSync } from "expo-sqlite";

const expo = openDatabaseSync("songs.sqlite");
expo.execSync("PRAGMA journal_mode = WAL;");

const db = drizzle(expo);

export { db }