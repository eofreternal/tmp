import useMusic from "@/state/music"
import { globalStyles } from "@/styles/global"
import { View, Text, Image } from "react-native"
import { useAudioPlayerStatus } from "expo-audio"

function secondsToFormattedText(time: number) {
    const seconds = (parseInt(time.toString()) % 60).toString().padStart(2, "0")
    const minutes = parseInt((time / 60).toString())

    return `${minutes}:${seconds}`
}

export function Player() {
    const player = useMusic((state) => state.player)
    const currentSong = useMusic((state) => state.currentlyPlayingSong)
    // For some reason, this updates in increments of 0.5
    // Like, it updates it super fast initially and then has a 0.2s gap then 0.5s gaps afterwards for every update
    // I dhould dig into the code later to find out why and drop it down to like 100ms or something
    const status = useAudioPlayerStatus(player)

    return (
        (currentSong !== null) ?
            (<View style={{
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
            </View>) : null
    )
}