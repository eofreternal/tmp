import useMusic from "@/state/music"
import { colors, globalStyles } from "@/styles/global"
import { View, Text, Image, Pressable } from "react-native"
import { useAudioPlayerStatus } from "expo-audio"
import { secondsToFormattedText } from "@/util"

export default function Preview() {
    const setShowPlayer = useMusic((state) => state.setShowPlayer)
    const player = useMusic((state) => state.player)
    const status = useAudioPlayerStatus(player)
    const currentSong = useMusic((state) => state.queue[state.currentQueueIndex])

    return (
        (currentSong !== undefined) ?
            (<>
                <Pressable onPress={() => { setShowPlayer(true) }}>
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

                        backgroundColor: colors.background
                    }}>
                        <Image source={{ uri: currentSong.coverArtUri || "" }} style={{ width: 45, height: 45, borderRadius: 8 }} />
                        <Text style={globalStyles.text}>{currentSong.name}</Text>
                        <Text style={globalStyles.text}>{secondsToFormattedText(status.currentTime)} / {secondsToFormattedText(status.duration)}</Text>
                    </View>
                </Pressable>
            </>) : <></>
    )
}