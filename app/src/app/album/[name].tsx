import { Stack } from "expo-router"
import { useLocalSearchParams } from "expo-router";

import { colors, globalStyles } from "@/styles/global";
import { useEffect, useState } from "react";

import { Song } from "@/state/music";
import { FlashList } from "@shopify/flash-list";
import { SafeAreaView } from "react-native-safe-area-context";
import SongThreeDotMenu from "@/components/songThreeDotMenu";
import { fetchSongsInAlbum } from "@/util";
import Preview from "@/components/preview";

import SongComponent from "@/components/song";

export default function albumIdPage() {
    const { name }: { name: string } = useLocalSearchParams()
    const [selectedSong, setSelectedSong] = useState<{
        id: number
        name: string
        coverArtUri: string | null
    } | null>(null)
    const [showThreeDotMenu, setShowThreeDotMenu] = useState(false)

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
                    <SongComponent item={item} setSelectedSong={(item) => setSelectedSong(item)} setShowThreeDotMenu={(o) => setShowThreeDotMenu(o)} />
                ))}

                contentContainerStyle={{
                    padding: 10
                }}
            />

            <Preview />
            <SongThreeDotMenu show={showThreeDotMenu} songId={selectedSong?.id} onClose={() => setShowThreeDotMenu(false)} />
        </SafeAreaView>
    )
}