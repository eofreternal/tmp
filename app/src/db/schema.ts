import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core"
import { defineRelations } from 'drizzle-orm';

export const songsTable = sqliteTable("songs", {
    id: integer().primaryKey({ autoIncrement: true }),
    name: text().notNull(),
    artist: text().notNull(),
    year: integer(),

    uri: text().notNull(),
    coverArtUri: text(),

    lastModified: integer({ mode: "timestamp_ms" }).notNull()
})

export const playlistTable = sqliteTable("playlists", {
    id: integer().primaryKey({ autoIncrement: true }),
    name: text().notNull(),
})

export const playlistSongsJunctionTable = sqliteTable("playlistSongsJunction", {
    playlistId: integer().notNull().references(() => playlistTable.id, { onDelete: "cascade" }),
    songId: integer().notNull().references(() => songsTable.id, { onDelete: "cascade" }),

    dateAdded: integer({ mode: "timestamp_ms" }).notNull()
})

export const relations = defineRelations({ songsTable, playlistTable, playlistSongsJunctionTable }, (r) => ({
    songsTable: {
        playlists: r.many.playlistTable({
            from: r.songsTable.id.through(r.playlistSongsJunctionTable.songId),
            to: r.playlistTable.id.through(r.playlistSongsJunctionTable.playlistId)
        })
    },

    playlistTable: {
        songs: r.many.songsTable({
            from: r.playlistTable.id.through(r.playlistSongsJunctionTable.playlistId),
            to: r.songsTable.id.through(r.playlistSongsJunctionTable.songId)
        })
    },

    playlistSongsJunctionTable: {
        songData: r.one.songsTable({
            from: r.playlistSongsJunctionTable.songId,
            to: r.songsTable.id
        }),

        playlistData: r.one.playlistTable({
            from: r.playlistSongsJunctionTable.playlistId,
            to: r.playlistTable.id
        })
    }
}))