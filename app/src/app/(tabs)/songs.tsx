import { Text, View } from "react-native";
import { FlashList } from "@shopify/flash-list"

import { globalStyles } from "@/styles/global"

import useMusic from "@/state/music"
import { useState } from "react";
import SongThreeDotMenu from "@/components/songThreeDotMenu";
import SongComponent from "@/components/song";

export default function SongsScreen() {
    const musicState = useMusic((state) => state)

    const [selectedSong, setSelectedSong] = useState<{
        id: number
        name: string
        coverArtUri: string | null
    } | null>(null)
    const [showThreeDotMenu, setShowThreeDotMenu] = useState(false)

    return (
        <View style={[globalStyles.view]}>
            <FlashList
                data={musicState.songs}
                keyExtractor={(item) => item.id.toString()}
                renderItem={({ item }) => (
                    <SongComponent item={item} setSelectedSong={(item) => setSelectedSong(item)} setShowThreeDotMenu={(o) => setShowThreeDotMenu(o)} />
                )}

                ListEmptyComponent={<Text style={globalStyles.text}>No songs</Text>}
                contentContainerStyle={{
                    padding: 10
                }}
            />
            <SongThreeDotMenu show={showThreeDotMenu} songId={selectedSong?.id} onClose={() => setShowThreeDotMenu(false)} />
        </View>
    );
}
