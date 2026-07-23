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
                            onPress={() => {
                                if (player.paused) {
                                    player.play()
                                } else {
                                    player.pause()
                                }
                            }}>
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