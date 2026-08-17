import { relations } from "drizzle-orm"
import { sqliteTable, integer, text } from "drizzle-orm/sqlite-core"

export const roomsTable = sqliteTable("rooms", {
    id: integer().primaryKey({ autoIncrement: true }),
    name: text().notNull(),
    creator: text().notNull(),

    creationDate: integer({ mode: "timestamp_ms" }).notNull()
})

export const roomMembersTable = sqliteTable("room_members", {
    roomId: integer().notNull().references(() => roomsTable.id, { onDelete: "cascade" }),
    memberId: text().notNull()
})

export const uploadedSongsTable = sqliteTable("uploaded_songs", {
    id: integer().primaryKey({ autoIncrement: true }),
    hash: text().notNull(),
    coverArtName: text(),
    roomId: integer().notNull(),
    mimeType: text().notNull(),

    //metadata
    name: text().notNull(),
    artist: text().notNull(),

    creationDate: integer({ mode: "timestamp_ms" }).notNull()
})

export const roomsRelations = relations(roomsTable, ({ many }) => ({
    members: many(roomMembersTable)
}))

export const roomMembersRelations = relations(roomMembersTable, ({ one }) => ({
    room: one(roomsTable, {
        fields: [roomMembersTable.roomId],
        references: [roomsTable.id]
    })
}))