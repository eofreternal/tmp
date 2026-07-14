import { Image, View, Text, Pressable, Modal } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context";
import Entypo from "@react-native-vector-icons/entypo";
import Ionicons from "@react-native-vector-icons/ionicons";
import Slider from '@expo/ui/community/slider';

import useMusic from "@/state/music"
import { colors, globalStyles } from "@/styles/global"
import { AudioPlayer, useAudioPlayerStatus } from "expo-audio";
import { secondsToFormattedText } from "@/util";

import Animated, { withTiming, Easing, useSharedValue, useAnimatedStyle, FadeInDown } from 'react-native-reanimated';
import { useEffect } from "react";

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

export default function Player({ isVisible, closeModal }: {
    isVisible: boolean, closeModal: () => void
}) {
    const player = useMusic((state) => state.player)
    const currentSong = useMusic((state) => state.currentlyPlayingSong)
    const status = useAudioPlayerStatus(player)

    const opacity = useSharedValue(0)
    const translateY = useSharedValue(0)

    useEffect(() => {
        if (isVisible) {
            opacity.value = withTiming(1, { duration: 300, easing: Easing.out(Easing.quad) })
            translateY.value = withTiming(0, { duration: 300, easing: Easing.out(Easing.quad) })
        } else {
            opacity.value = withTiming(0, { duration: 300, easing: Easing.out(Easing.quad) })
            translateY.value = withTiming(50, { duration: 300, easing: Easing.out(Easing.quad) })
        }
    }, [isVisible])

    const animatedStyle = useAnimatedStyle(() => ({
        opacity: opacity.value,
        transform: [{ translateY: translateY.value }]
    }))

    if (currentSong === null) {
        return <></>
    }

    return (
        <View
            pointerEvents="box-none"
            style={{
                position: "absolute",
                top: 0,
                left: 0,
                bottom: 0,
                right: 0,

                zIndex: 999,
                elevation: 999
            }}
        >
            <Animated.View
                pointerEvents={isVisible ? "auto" : "none"}

                style={[{
                    flex: 1,
                    height: "100%",
                    backgroundColor: colors.background,

                    borderColor: "green",
                    borderWidth: 1
                }, animatedStyle]}
            >
                <SafeAreaView style={[{
                    display: "flex",
                    flexDirection: "column",

                    alignItems: "center",
                    padding: 16
                }, globalStyles.view]}>
                    <Pressable style={{
                        display: "flex",
                        flexDirection: "column",

                        width: "100%",

                        alignItems: "flex-start"
                    }} onPress={() => closeModal()}>
                        <Ionicons name="chevron-down-outline" size={24} color="white" />
                    </Pressable>

                    <View style={{
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "center",
                        alignItems: "center",

                        width: "100%",
                        maxHeight: "66%",

                        flexGrow: 1,
                        flexShrink: 1,
                        flexBasis: "auto"
                    }}>
                        <Image source={{ uri: currentSong.coverArtUri || "" }} style={{
                            aspectRatio: 1,
                            width: "100%",
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
                            justifyContent: "space-between",

                            width: "100%",
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

                            <View style={{
                                display: "flex",
                                flexDirection: "row",

                                gap: 16
                            }}>
                                <Pressable>
                                    <Entypo name="dots-three-vertical" size={24} color="white" />
                                </Pressable>
                            </View>
                        </View>

                        <View style={{
                            display: "flex",
                            flexDirection: "column",

                            width: 400,
                        }}>
                            <Pressable
                                onPress={() => { handlePlayPause(player) }}
                                style={{
                                    backgroundColor: "#81cfff",
                                    borderRadius: 50,
                                    padding: 8,
                                    alignSelf: 'flex-start'
                                }}>
                                {player.paused ? <Ionicons name="play" size={36} color={colors.background} /> : <Ionicons name="pause" size={36} color={colors.background} />}
                            </Pressable>

                            <View style={{
                                display: "flex",
                                flexDirection: "row",
                                gap: 8,

                                alignItems: "center",

                                maxWidth: 400
                            }}>
                                <Text style={[globalStyles.text, { width: 30 }]}>{secondsToFormattedText(status.currentTime)}</Text>
                                <View style={{ flex: 1 }}>
                                    <Slider style={{ width: "100%" }} lowerLimit={0} value={status.currentTime} maximumValue={status.duration} />
                                </View>
                                <Text style={[globalStyles.text, { width: 30 }]}>{secondsToFormattedText(status.duration)}</Text>
                            </View>
                        </View>
                    </View>
                </SafeAreaView>
            </Animated.View>
        </View>
    )
}