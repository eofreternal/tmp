import { globalStyles } from "@/styles/global"
import { SafeAreaView } from "react-native-safe-area-context";
import { Image, Text, View } from "react-native"

import { useLiveQuery } from "drizzle-orm/expo-sqlite"
import { db } from "@/db/index"
import * as schema from "@/db/schema"
import { FlatList } from "react-native";
import { Link } from "expo-router";

import CreatePlaylist from "@/components/createPlaylist"
import { useEffect, useState } from "react";
import { Song } from "@/state/music";
import { InferSelectModel } from "drizzle-orm";

export default function PlaylistsPage() {
    const [showCreatePlaylist, setShowCreatePlaylist] = useState(false)

    const [playlists, setPlaylists] = useState<InferSelectModel<typeof schema.playlistTable>[]>([])
    const [firstSongInEachPlaylist, setFirstSongInEachPlaylist] = useState(new Map<number, Song>())

    useEffect(() => {
        async function temp() {
            const p = await db.select().from(schema.playlistTable)
            setPlaylists(p)

            p.forEach(async item => {
                const firstSong = await db.query.playlistSongsJunctionTable.findFirst({
                    where: {
                        playlistId: item.id
                    },

                    with: {
                        songData: true
                    },

                    orderBy: {
                        dateAdded: "asc"
                    }
                })
                if (firstSong === undefined) {
                    return
                }

                setFirstSongInEachPlaylist((old) => {
                    const newMap = new Map(old)
                    newMap.set(item.id, firstSong.songData!)
                    return newMap
                })
            })
        }
        temp()
    }, [])

    return (
        <SafeAreaView style={[globalStyles.view]}>
            <FlatList
                initialNumToRender={16}
                data={playlists}
                keyExtractor={(data) => data.id.toString()}

                renderItem={({ item }) => (
                    <View style={{
                        display: "flex",
                        flexDirection: "row",
                        gap: 8,

                        alignItems: "center"
                    }}>
                        <Image source={{ uri: firstSongInEachPlaylist.get(item.id)?.coverArtUri || "" }} style={{ width: 45, height: 45, borderRadius: 8 }} />
                        <Link href={{ pathname: "/playlist/[id]", params: { id: item.id.toString() } }} style={globalStyles.text}>
                            {item.name}
                        </Link>
                    </View>
                )}

                contentContainerStyle={{
                    gap: 16
                }}

                ListEmptyComponent={(
                    <>
                        <Text style={[{
                            textAlign: "center"
                        }, globalStyles.accentText]}>No playlists yet!</Text>
                    </>
                )}

                style={{
                    flexGrow: 0,
                    height: "auto",

                    borderColor: "purple",
                    borderWidth: 1
                }}
            />

            <Text style={[{
                textAlign: "center"
            }, globalStyles.accentText]} onPress={() => setShowCreatePlaylist(true)}>Create a playlist</Text>
            <CreatePlaylist show={showCreatePlaylist} onClose={() => setShowCreatePlaylist(false)} />
        </SafeAreaView>
    )
}