import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core"

export const songsTable = sqliteTable("songs", {
    id: integer().primaryKey({ autoIncrement: true }),
    name: text().notNull(),
    year: integer(),

    uri: text().notNull(),
    coverArtUri: text(),

    lastModified: integer({ mode: "timestamp_ms" }).notNull()
})
