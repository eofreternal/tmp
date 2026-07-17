import { Text, FlatList, Pressable, View } from "react-native"
import { useState, useEffect } from "react";

import { BottomSheet, RNHostView, Host } from '@expo/ui';
import MaterialDesignIcons from '@react-native-vector-icons/material-design-icons';

import { db } from "@/db/index"
import * as schema from "@/db/schema"
import { eq, and } from "drizzle-orm"
import { useLiveQuery } from "drizzle-orm/expo-sqlite"
import { colors, globalStyles } from "@/styles/global";

import CreatePlaylist from "@/components/createPlaylist"

export default function songThreeDotMenu({ show, songId, onClose }: { show: boolean, songId: number, onClose: () => void }) {
    const [showCreatePlaylist, setShowCreatePlaylist] = useState(false)
    const [showPlaylists, setShowPlaylists] = useState(false)
    const [playlistsTheSongIsInID, setPlaylistsTheSongIsInID] = useState<number[]>([])

    const { data: playlists } = useLiveQuery(db.select().from(schema.playlistTable))

    async function syncSongPresenceInPlaylists() {
        const songs = await db.select().from(schema.playlistSongsJunctionTable).where(eq(schema.playlistSongsJunctionTable.songId, songId))
        setPlaylistsTheSongIsInID(songs.map(item => item.playlistId))
    }

    useEffect(() => {
        syncSongPresenceInPlaylists()
    }, [playlists])

    async function triggerShowPlaylists() {
        const songs = await db.select().from(schema.playlistSongsJunctionTable).where(eq(schema.playlistSongsJunctionTable.songId, songId))
        setShowPlaylists(true)
        setPlaylistsTheSongIsInID(songs.map(item => item.playlistId))
    }

    async function toggleToPlaylist(playlistId: number) {
        const [song] = await db.select().from(schema.playlistSongsJunctionTable).where(and(eq(schema.playlistSongsJunctionTable.songId, songId), eq(schema.playlistSongsJunctionTable.playlistId, playlistId)))

        if (song === undefined) {
            await db.insert(schema.playlistSongsJunctionTable).values({
                playlistId: playlistId,
                songId: songId,

                dateAdded: new Date()
            })
        } else {
            await db.delete(schema.playlistSongsJunctionTable).where(and(eq(schema.playlistSongsJunctionTable.songId, songId), eq(schema.playlistSongsJunctionTable.playlistId, playlistId)))
        }
        await syncSongPresenceInPlaylists()
    }

    return (
        <>
            <Host>
                <BottomSheet isPresented={show} onDismiss={() => onClose()}>
                    <RNHostView matchContents>
                        <View style={{
                            display: "flex",
                            flexDirection: "column",

                            gap: 12
                        }}>
                            <Pressable onPress={() => triggerShowPlaylists()} style={{
                                display: "flex",
                                flexDirection: "row",

                                gap: 8
                            }}>
                                <MaterialDesignIcons name="playlist-plus" size={24} color="white" />
                                <Text style={globalStyles.text}>Add to a playlist</Text>
                            </Pressable>
                        </View>
                    </RNHostView>
                </BottomSheet>

                <BottomSheet isPresented={showPlaylists} onDismiss={() => setShowPlaylists(false)}>
                    <RNHostView style={{
                        width: "100%",
                        height: "auto"
                    }}>
                        <View style={{
                            display: "flex",
                            flexDirection: "column",

                            gap: 12
                        }}>
                            <FlatList
                                initialNumToRender={16}

                                data={playlists}
                                keyExtractor={(data) => data.id.toString()}

                                renderItem={({ item }) => (
                                    <Pressable onPress={() => toggleToPlaylist(item.id)} style={{
                                        display: "flex",
                                        flexDirection: "row",

                                        gap: 8,
                                        alignItems: "center",

                                        padding: 8,
                                        paddingLeft: 0
                                    }}>
                                        {playlistsTheSongIsInID.includes(item.id) ?
                                            <>
                                                <MaterialDesignIcons name="playlist-check" size={24} color="white" />
                                            </> :
                                            <>
                                                <MaterialDesignIcons name="playlist-plus" size={24} color="white" />
                                            </>
                                        }
                                        <Text style={globalStyles.text}>{item.name}</Text>
                                    </Pressable>
                                )}

                                contentContainerStyle={{
                                    gap: 16
                                }}
                            />
                            <Text onPress={() => setShowCreatePlaylist(true)} style={{ color: colors.accent }}>Create a playlist</Text>
                        </View>
                    </RNHostView>
                </BottomSheet>

                <CreatePlaylist show={showCreatePlaylist} onClose={() => { setShowCreatePlaylist(false) }} />
            </Host>
        </>
    )
}