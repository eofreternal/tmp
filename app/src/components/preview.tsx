import useMusic from "@/state/music"
import { globalStyles } from "@/styles/global"
import { View, Text, Image, Pressable } from "react-native"
import { useAudioPlayerStatus } from "expo-audio"
import { router } from "expo-router"

function secondsToFormattedText(time: number) {
    const seconds = (parseInt(time.toString()) % 60).toString().padStart(2, "0")
    const minutes = parseInt((time / 60).toString())

    return `${minutes}:${seconds}`
}

export default function Preview() {
    const player = useMusic((state) => state.player)
    const currentSong = useMusic((state) => state.currentlyPlayingSong)
    const status = useAudioPlayerStatus(player)

    return (
        (currentSong !== null) ?
            (<>
                <Pressable onPress={() => router.replace("/player")}>
                    <View style={{
                        position: "fixed",
                        display: "flex",
                        flexDirection: "row",
                        gap: 8,

                        bottom: 0,

                        alignItems: "center",

                        //debugging
                        borderColor: "red",
                        borderWidth: 1,
                    }}>
                        <Image source={{ uri: currentSong.coverArtUri || "" }} style={{ width: 45, height: 45, borderRadius: 8 }} />
                        <Text style={globalStyles.text}>{currentSong.name}</Text>
                        <Text style={globalStyles.text}>{secondsToFormattedText(status.currentTime)} / {secondsToFormattedText(status.duration)}</Text>
                    </View>
                </Pressable>
            </>) : <></>
    )
}