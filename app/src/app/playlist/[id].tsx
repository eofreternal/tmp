import { db } from "@/db";
import * as schema from "@/db/schema"
import { colors, globalStyles } from "@/styles/global";
import { InferSelectModel } from "drizzle-orm"


import { Stack, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { View, Text, Pressable, Image, FlatList } from "react-native";
import Entypo from "@react-native-vector-icons/entypo";

import { SafeAreaView } from "react-native-safe-area-context";

import useMusic from "@/state/music"

export default function playlistIdPage() {
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
        <SafeAreaView style={globalStyles.view}>
            <Stack.Screen options={{
                title: playlistData.name,
                headerTintColor: colors.text,
                headerRight: () => (<Entypo name="dots-three-vertical" size={24} color="white" />)
            }}
            />

            <FlatList
                data={playlistData.songs}

                renderItem={({ item }) => (
                    <Pressable onPress={() => musicState.setPlayer(item)} style={{ display: "flex", flexDirection: "row" }}>
                        <View style={{ display: "flex", flexDirection: "row", gap: "16", alignItems: "center" }}>
                            <Image source={{ uri: item.coverArtUri || "" }} style={{ width: 45, height: 45, borderRadius: 8 }} />
                            <Text style={globalStyles.text}>{item.name}</Text>
                            <Text style={globalStyles.text}>{JSON.stringify(item)}</Text>
                        </View>
                    </Pressable>
                )}
            />
        </SafeAreaView>
    )
}