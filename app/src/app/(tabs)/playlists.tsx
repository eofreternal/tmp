import { globalStyles } from "@/styles/global"
import { SafeAreaView } from "react-native-safe-area-context";
import { Text } from "react-native"

import { useLiveQuery } from "drizzle-orm/expo-sqlite"
import { db } from "@/db/index"
import * as schema from "@/db/schema"
import { FlatList } from "react-native";
import { Link } from "expo-router";

import CreatePlaylist from "@/components/createPlaylist"
import { useState } from "react";

export default function PlaylistsPage() {
    const [showCreatePlaylist, setShowCreatePlaylist] = useState(false)

    const { data: playlists } = useLiveQuery(db.select().from(schema.playlistTable))

    return (
        <SafeAreaView style={[globalStyles.view]}>
            <FlatList
                initialNumToRender={16}
                data={playlists}
                keyExtractor={(data) => data.id.toString()}

                renderItem={({ item }) => (
                    <Link href={{ pathname: "/playlist/[id]", params: { id: item.id.toString() } }} style={globalStyles.text}>
                        {item.name}
                    </Link>
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