import { drizzle } from "drizzle-orm/expo-sqlite";
import { openDatabaseSync } from "expo-sqlite";
import { relations } from "./schema"

const expo = openDatabaseSync("songs.sqlite");
expo.execSync("PRAGMA journal_mode = WAL;");

const db = drizzle(expo, { relations: relations });

export { db }