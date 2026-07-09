import { View, Image, Text } from "react-native"

import useMusic from "@/state/music"
import { globalStyles } from "@/styles/global"

export function Player() {
    const currentSong = useMusic((state) => state.currentlyPlayingSong)

    return (
        <>
            {!!currentSong ? <View style={{
                display: "flex",
                flexDirection: "column",

                gap: 8
            }}>
                <Image source={{ uri: currentSong.coverArtUri || "" }} />
                <Text style={globalStyles.text}>{currentSong.name}</Text>
            </View> : undefined
            }
        </>
    )
}