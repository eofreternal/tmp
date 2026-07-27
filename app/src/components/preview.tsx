import useMusic from "@/state/music"
import { colors, globalStyles } from "@/styles/global"
import { View, Text, Image, Pressable } from "react-native"
import { useAudioPlayerStatus } from "expo-audio"
import { secondsToFormattedText } from "@/util"
import Ionicons from "@react-native-vector-icons/ionicons"

export default function Preview() {
    const setShowPlayer = useMusic((state) => state.setShowPlayer)
    const player = useMusic((state) => state.player)
    const status = useAudioPlayerStatus(player)
    const currentSong = useMusic((state) => state.queue[state.currentQueueIndex])

    function handlePlayPause() {
        if (player.paused) {
            // There's a slight bit of inaccuracy between the currentTime and the duration of the song
            // If they're about a 200ms apart, just consider it the ending of the song and loop it when the user presses the "start" button
            const difference = Math.abs(player.duration - player.currentTime)
            console.log(difference)
            if (difference < 0.2) {
                player.seekTo(0)
            }

            player.play()
            return
        }

        player.pause()
    }

    return (
        (currentSong !== undefined) ?
            (<>
                <Pressable onPress={() => { setShowPlayer(true) }}>
                    <View style={{
                        position: "fixed",
                        display: "flex",
                        flexDirection: "row",
                        justifyContent: "space-between",
                        gap: 12,
                        padding: 10,

                        bottom: 0,

                        alignItems: "center",

                        backgroundColor: colors.secondary
                    }}>
                        <View style={{
                            display: "flex",
                            flexDirection: "row",
                            gap: 12,

                            alignItems: "center"
                        }}>
                            <Image source={{ uri: currentSong.coverArtUri || "" }} style={{ width: 45, height: 45, borderRadius: 8 }} />
                            <Text style={globalStyles.text}>{currentSong.name}</Text>
                        </View>

                        <Pressable style={{
                            display: "flex",
                            flexDirection: "column",

                            alignItems: "center"
                        }}
                            onPress={() => handlePlayPause()}>
                            {player.paused ? <Ionicons name="play" size={28} color={colors.light} /> : <Ionicons name="pause" size={28} color={colors.light} />}
                            <Text style={[{
                                fontSize: 10
                            }, globalStyles.text]}>{secondsToFormattedText(status.currentTime)} / {secondsToFormattedText(status.duration)}</Text>
                        </Pressable>
                    </View>
                </Pressable>
            </>) : <></>
    )
}