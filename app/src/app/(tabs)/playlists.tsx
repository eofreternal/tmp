import { globalStyles } from "@/styles/global"
import { SafeAreaView } from "react-native-safe-area-context";
import { Image, Text, View } from "react-native"

import { FlatList } from "react-native";
import { Link } from "expo-router";

import CreatePlaylist from "@/components/createPlaylist"
import { useEffect, useState } from "react";
import { fetchPlaylists } from "@/util"

export default function PlaylistsPage() {
    const [showCreatePlaylist, setShowCreatePlaylist] = useState(false)

    const [playlists, setPlaylists] = useState<Awaited<ReturnType<typeof fetchPlaylists>>>([])

    useEffect(() => {
        async function temp() {
            setPlaylists(await fetchPlaylists())
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
                        <Image source={{ uri: item.coverArtUri || "" }} style={{ width: 45, height: 45, borderRadius: 8 }} />
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