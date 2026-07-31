import { Text, View } from "react-native";
import { FlashList } from "@shopify/flash-list"

import { globalStyles } from "@/styles/global"

import useMusic from "@/state/music"
import { useState } from "react";
import SongThreeDotMenu from "@/components/songThreeDotMenu";
import SongComponent from "@/components/song";

export default function SongsScreen() {
    const musicState = useMusic((state) => state)

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

    return (
        <View style={[globalStyles.view]}>
            <FlashList
                data={musicState.songs}
                keyExtractor={(item) => item.id.toString()}
                renderItem={({ item }) => (
                    <SongComponent item={item} set={(data) => setThreeDotMenu(data)} />
                )}

                ListEmptyComponent={<Text style={globalStyles.text}>No songs</Text>}
                contentContainerStyle={{
                    padding: 10
                }}
            />
            <SongThreeDotMenu show={threeDotMenu.show} songId={threeDotMenu.show ? threeDotMenu.song.id : undefined} onClose={() => setThreeDotMenu({ show: false, song: null })} />
        </View>
    );
}
