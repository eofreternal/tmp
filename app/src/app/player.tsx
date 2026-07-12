import { Image, View, Text, Pressable } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context";
import Ionicons from "@react-native-vector-icons/ionicons";
import Slider from '@expo/ui/community/slider';

import useMusic from "@/state/music"
import { globalStyles } from "@/styles/global"
import { AudioPlayer, useAudioPlayerStatus } from "expo-audio";
import { router } from "expo-router";

function handlePlayPause(player: AudioPlayer) {
    if (player.paused) {
        // There's a slight bit of inaccuracy between the currentTime and the duration of the song
        // If they're about a 200ms apart, just consider it the ending of the song and loop it when the user presses the "start" button
        const difference = Math.abs(player.duration - player.currentTime)
        if (difference < 0.2) {
            player.seekTo(0)
        }

        player.play()
        return
    }

    player.pause()
}

export default function Player() {
    const player = useMusic((state) => state.player)
    const currentSong = useMusic((state) => state.currentlyPlayingSong)
    const status = useAudioPlayerStatus(player)

    return (
        <>
            {(currentSong !== null) ?
                <>
                    <SafeAreaView style={[{
                        display: "flex",
                        flexDirection: "column",

                        alignItems: "center"
                    }, globalStyles.view]}>
                        <Pressable style={{
                            display: "flex",
                            flexDirection: "column",
                            width: 350,

                            alignItems: "flex-start"
                        }} onPress={() => { router.back() }}>
                            <Ionicons name="chevron-down-outline" size={24} color="white" />
                        </Pressable>

                        <View style={{
                            display: "flex",
                            flexDirection: "column",
                            justifyContent: "center",
                            alignItems: "center",

                            maxHeight: "66%",

                            flexGrow: 1,
                            flexShrink: 1,
                            flexBasis: "auto"
                        }}>
                            <Image source={{ uri: currentSong.coverArtUri || "" }} style={{
                                width: 350,
                                height: 350,
                                borderRadius: 8
                            }} />
                        </View>

                        <View style={{
                            display: "flex",
                            flexDirection: "column",
                        }}>
                            <View style={[{
                                display: "flex",
                                flexDirection: "row",

                                width: 350,
                                bottom: 0,

                                flexGrow: 0,
                                flexShrink: 1
                            }]}>
                                <View style={{
                                    display: "flex",
                                    flexDirection: "column",

                                    gap: 8
                                }}>
                                    <Text style={[{
                                        textAlign: "left",

                                        fontSize: 20,
                                        fontWeight: "800"
                                    }, globalStyles.text]}>{currentSong.name}</Text>
                                    <Text style={[{
                                        textAlign: "left",

                                        fontSize: 16,
                                        fontWeight: "600"
                                    }, globalStyles.secondaryText]}>{currentSong.artist}</Text>
                                </View>
                            </View>

                            <View style={{
                                display: "flex",
                                flexDirection: "column",

                                width: 350,

                            }}>
                                <Pressable onPress={() => { handlePlayPause(player) }}>
                                    {player.paused ? <Ionicons name="play" size={36} color="white" /> : <Ionicons name="pause" size={36} color="white" />}
                                </Pressable>

                                <Slider lowerLimit={0} value={status.currentTime} maximumValue={status.duration} />
                            </View>
                        </View>
                    </SafeAreaView>
                </> : <></>
            }
        </>
    )
}