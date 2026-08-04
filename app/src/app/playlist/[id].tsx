import { db } from "@/db";
import * as schema from "@/db/schema"
import { colors, globalStyles } from "@/styles/global";
import { InferSelectModel, eq } from "drizzle-orm"

import { router, Stack, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { Text, Pressable } from "react-native";
import { FlashList } from "@shopify/flash-list";
import { SafeAreaView } from "react-native-safe-area-context";
import Entypo from "@react-native-vector-icons/entypo";
import Ionicons from "@react-native-vector-icons/ionicons";

import { BottomSheet, Button, Column, Host } from "@expo/ui";
import Preview from "@/components/preview";
import SongComponent from "@/components/song";
import SongThreeDotMenu from "@/components/songThreeDotMenu";

async function deletePlaylist(id: number) {
    router.navigate("/playlists")
    await db.delete(schema.playlistTable).where(eq(schema.playlistTable.id, id))
}

export default function playlistIdPage() {
    const [showOptions, setShowOptions] = useState(false)

    const { id }: { id: string } = useLocalSearchParams()
    const parsedId = parseInt(id)

    const [playlistData, setPlaylistData] = useState<InferSelectModel<typeof schema.playlistTable> & { songs: InferSelectModel<typeof schema.songsTable>[] }>({
        id: 0,
        name: "",

        songs: []
    })
    const [threeDotMenu, setThreeDotMenu] = useState<({
        show: false
        song: null
    }) | ({
        show: true
        song: {
            id: number
            name: string
            coverArtUri: string | null
        }
    })>({
        show: false,
        song: null
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
                    headerTintColor: colors.light,
                    headerRight: () => (
                        <Pressable onPress={() => setShowOptions(true)}>
                            <Entypo name="dots-three-vertical" size={24} color="white" />
                        </Pressable>
                    )
                }}
                />

                <FlashList
                    data={playlistData.songs}

                    renderItem={({ item }) => (
                        <SongComponent item={item} set={(data) => setThreeDotMenu(data)} />
                    )}

                    contentContainerStyle={{
                        padding: 10
                    }}
                />

                <Preview />
                <SongThreeDotMenu show={threeDotMenu.show} songId={threeDotMenu.show ? threeDotMenu.song.id : undefined} onClose={() => setThreeDotMenu({ show: false, song: null })} />
            </SafeAreaView>

            <BottomSheet isPresented={showOptions} onDismiss={() => setShowOptions(false)}>
                <Host>
                    <Column spacing={16}>
                        <Button onPress={() => deletePlaylist(playlistData.id)}>
                            <Ionicons name="trash-outline" size={36} color="red" />
                            <Text>Delete playlist</Text>
                        </Button>
                    </Column>
                </Host>
            </BottomSheet>
        </>
    )
}