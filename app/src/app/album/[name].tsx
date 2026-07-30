import { Text, Pressable, View, Image } from "react-native"

import { Stack } from "expo-router"
import { useLocalSearchParams } from "expo-router";

import Entypo from "@react-native-vector-icons/entypo";
import { colors, globalStyles } from "@/styles/global";
import { useEffect, useState } from "react";

import { Song } from "@/state/music";
import { FlashList } from "@shopify/flash-list";
import { SafeAreaView } from "react-native-safe-area-context";
import useMusicStore from "@/state/music";
import SongThreeDotMenu from "@/components/songThreeDotMenu";
import { fetchSongsInAlbum } from "@/util";
import Preview from "@/components/preview";

export default function albumIdPage() {
    const { name }: { name: string } = useLocalSearchParams()
    const [selectedSong, setSelectedSong] = useState<Song>()
    const [showThreeDotMenu, setShowThreeDotMenu] = useState(false)
    const musicState = useMusicStore((state) => state)

    const [songs, setSongs] = useState<Song[]>([])
    useEffect(() => {
        async function temp() {
            setSongs(await fetchSongsInAlbum(name))
        }
        temp()
    })

    return (
        <SafeAreaView style={globalStyles.view}>
            <Stack.Screen options={{
                title: name,
                headerTintColor: colors.light
            }}
            />

            <FlashList
                data={songs}
                keyExtractor={((item) => item.id.toString())}

                renderItem={(({ item }) => (
                    <Pressable
                        onPress={async () => {
                            musicState.clearQueue()
                            await musicState.addSongToQueue(item.id)
                            musicState.setCurrentQueueIndex(0)
                            musicState.startPlayer()
                        }}
                        style={{
                            display: "flex",
                            flexDirection: "row",
                            marginBottom: 16
                        }}>
                        <View style={{
                            display: "flex",
                            flexDirection: "row",
                            gap: "16",
                            justifyContent: "space-between",
                            width: "100%",
                            alignItems: "center"
                        }}>
                            <View style={{
                                display: "flex",
                                flexDirection: "row",
                                gap: "16",
                                alignItems: "center"
                            }}>
                                <Text style={{
                                    color: !!item.trackNumber ? colors.light : "rgba(0, 0, 0, 0)"
                                }}>#{item.trackNumber?.toString().padStart(2, "0")}</Text>
                                <Image source={{ uri: item.coverArtUri || "" }} style={{ width: 45, height: 45, borderRadius: 8 }} />
                                <Text style={globalStyles.text}>{item.name}</Text>
                            </View>
                            <Entypo onPress={() => {
                                setSelectedSong(item)
                                setShowThreeDotMenu(true)
                            }} name="dots-three-vertical" size={16} color="white" />
                        </View>
                    </Pressable>
                ))}
            />

            <Preview />
            <SongThreeDotMenu show={showThreeDotMenu} songId={selectedSong?.id} onClose={() => setShowThreeDotMenu(false)} />
        </SafeAreaView>
    )
}