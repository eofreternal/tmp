import { db } from "@/db";
import * as schema from "@/db/schema"
import { colors, globalStyles } from "@/styles/global";
import { InferSelectModel, eq } from "drizzle-orm"

import { router, Stack, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { View, Text, Pressable, Image, FlatList } from "react-native";
import Entypo from "@react-native-vector-icons/entypo";
import Ionicons from "@react-native-vector-icons/ionicons";

import { SafeAreaView } from "react-native-safe-area-context";

import useMusic from "@/state/music"
import { BottomSheet, Button, Column, Host } from "@expo/ui";

async function deletePlaylist(id: number) {
    router.navigate("/playlists")
    await db.delete(schema.playlistTable).where(eq(schema.playlistTable.id, id))
}

export default function playlistIdPage() {
    const [showOptions, setShowOptions] = useState(false)

    const musicState = useMusic((state) => state)
    const { id }: { id: string } = useLocalSearchParams()
    const parsedId = parseInt(id)

    const [playlistData, setPlaylistData] = useState<InferSelectModel<typeof schema.playlistTable> & { songs: InferSelectModel<typeof schema.songsTable>[] }>({
        id: 0,
        name: "",

        songs: []
    })

    useEffect(() => {
        async function d() {
            const query = await db.query.playlistTable.findFirst({
                where: {
                    id: parsedId
                },

                with: {
                    songs: true
                }
            })
            if (query === undefined) {
                return //TODO: something has gone horibbly wrong. Throw eror?
            }

            setPlaylistData(query)
        }
        d()
    }, [])

    return (
        <>
            <SafeAreaView style={globalStyles.view}>
                <Stack.Screen options={{
                    title: playlistData.name,
                    headerTintColor: colors.text,
                    headerRight: () => (
                        <Pressable onPress={() => setShowOptions(true)}>
                            <Entypo name="dots-three-vertical" size={24} color="white" />
                        </Pressable>
                    )
                }}
                />

                <FlatList
                    data={playlistData.songs}

                    renderItem={({ item }) => (
                        <Pressable onPress={() => {
                            musicState.clearQueue()
                            musicState.addSongToQueue(item)
                            musicState.startPlayer()
                        }} style={{ display: "flex", flexDirection: "row" }}>
                            <View style={{ display: "flex", flexDirection: "row", gap: "16", alignItems: "center" }}>
                                <Image source={{ uri: item.coverArtUri || "" }} style={{ width: 45, height: 45, borderRadius: 8 }} />
                                <Text style={globalStyles.text}>{item.name}</Text>
                                <Text style={globalStyles.text}>{JSON.stringify(item)}</Text>
                            </View>
                        </Pressable>
                    )}
                />
            </SafeAreaView>

            <BottomSheet isPresented={showOptions} onDismiss={() => setShowOptions(false)}>
                <Host>
                    <Column spacing={16}>
                        <Button onPress={() => deletePlaylist(playlistData.id)}>
                            <Ionicons name="trash-outline" size={36} color="red" />
                            <Text>Delete</Text>
                        </Button>
                    </Column>
                </Host>
            </BottomSheet>
        </>
    )
}