import { Image, View, Text, Pressable, FlatList } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context";
import Entypo from "@react-native-vector-icons/entypo";
import Ionicons from "@react-native-vector-icons/ionicons";
import Slider from '@expo/ui/community/slider';

import useMusic from "@/state/music"
import { colors, globalStyles } from "@/styles/global"
import { useAudioPlayerStatus } from "expo-audio";
import { secondsToFormattedText } from "@/util";

import Animated, { withTiming, Easing, useSharedValue, useAnimatedStyle } from 'react-native-reanimated';
import { useEffect, useState } from "react";

import SongThreeDotMenu from "@/components/songThreeDotMenu";

export default function Player({ isVisible, closeModal }: {
    isVisible: boolean, closeModal: () => void
}) {
    const [showQueue, setShowQueue] = useState(false)
    const [showMenu, setShowMenu] = useState(false)

    const musicState = useMusic((state) => state)

    const player = useMusic((state) => state.player)
    const currentSong = useMusic((state) => state.queue[state.currentQueueIndex])
    const queue = useMusic((state) => state.queue)
    const currentQueueIndex = useMusic((state) => state.currentQueueIndex)
    const status = useAudioPlayerStatus(player)

    const opacity = useSharedValue(0)
    const translateY = useSharedValue(0)
    const queueOpacity = useSharedValue(0)
    const queueTranslateY = useSharedValue(0)

    function handlePlayPause() {
        if (player.paused) {
            // There's a slight bit of inaccuracy between the currentTime and the duration of the song
            // If they're about a 200ms apart, just consider it the ending of the song and loop it when the user presses the "start" button
            const difference = Math.abs(player.duration - player.currentTime)
            if (difference < 0.2) {
                player.seekTo(0)
            }

            musicState.startPlayer()
            return
        }

        musicState.stopPlayer()
    }


    useEffect(() => {
        if (isVisible) {
            opacity.value = withTiming(1, { duration: 300, easing: Easing.out(Easing.quad) })
            translateY.value = withTiming(0, { duration: 300, easing: Easing.out(Easing.quad) })
        } else {
            opacity.value = withTiming(0, { duration: 300, easing: Easing.out(Easing.quad) })
            translateY.value = withTiming(50, { duration: 300, easing: Easing.out(Easing.quad) })
        }
    }, [isVisible])

    useEffect(() => {
        if (showQueue) {
            queueOpacity.value = withTiming(1, { duration: 300, easing: Easing.out(Easing.quad) })
            queueTranslateY.value = withTiming(0, { duration: 300, easing: Easing.out(Easing.quad) })
        } else {
            queueOpacity.value = withTiming(0, { duration: 300, easing: Easing.out(Easing.quad) })
            queueTranslateY.value = withTiming(50, { duration: 300, easing: Easing.out(Easing.quad) })
        }
    }, [showQueue])

    const animatedStyle = useAnimatedStyle(() => ({
        opacity: opacity.value,
        transform: [{ translateY: translateY.value }]
    }))
    const queueAnimatedStyle = useAnimatedStyle(() => ({
        opacity: queueOpacity.value,
        transform: [{ translateY: queueTranslateY.value }]
    }))

    if (currentSong === undefined) {
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

                zIndex: 99,
                elevation: 99
            }}
        >
            <Animated.View
                pointerEvents={isVisible ? "auto" : "none"}

                style={[{
                    flex: 1,
                    height: "100%",
                    backgroundColor: colors.background,

                    zIndex: 100,

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
                        padding: 16,

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
                                <Pressable onPress={() => { setShowMenu(true) }}>
                                    <Entypo name="dots-three-vertical" size={24} color="white" />
                                </Pressable>
                            </View>
                        </View>

                        <View style={{
                            display: "flex",
                            flexDirection: "column",

                            width: 400,
                            gap: 16
                        }}>
                            <Pressable
                                onPress={() => { handlePlayPause() }}
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

                            <View style={{
                                display: "flex",
                                flexDirection: "row",

                                alignItems: "flex-start"
                            }}>
                                <Pressable onPress={() => setShowQueue(true)} style={{
                                    borderColor: "red",
                                    borderWidth: 1,
                                }}>
                                    <Text style={globalStyles.accentText}>Playing {currentQueueIndex + 1} of {queue.length}</Text>
                                </Pressable>
                            </View>
                        </View>
                    </View>
                </SafeAreaView>
            </Animated.View>

            <SongThreeDotMenu show={showMenu} songId={currentSong.id} onClose={() => setShowMenu(false)} />
            <Animated.View
                pointerEvents={showQueue ? "auto" : "none"}

                style={[{
                    position: "absolute",
                    flex: 1,
                    height: "100%",
                    width: "100%",
                    backgroundColor: colors.background,

                    zIndex: 101
                }, queueAnimatedStyle]}
            >
                <SafeAreaView style={[{
                    display: "flex",
                    flexDirection: "column",

                    alignItems: "center",

                    paddingLeft: 16,
                    paddingRight: 16
                }, globalStyles.view]}>
                    <Pressable style={{
                        display: "flex",
                        flexDirection: "column",

                        width: "100%",
                        padding: 16,

                        alignItems: "flex-start"
                    }} onPress={() => setShowQueue(false)}>
                        <Ionicons name="chevron-down-outline" size={24} color="white" />
                    </Pressable>
                    <FlatList
                        initialNumToRender={16}
                        data={queue}

                        keyExtractor={(data) => data.id.toString()}

                        renderItem={({ item, index }) => (
                            <Pressable
                                onPress={() => {
                                    musicState.setCurrentQueueIndex(index)
                                    musicState.startPlayer()
                                }}
                                style={{ display: "flex", flexDirection: "row" }}>
                                <View style={{ display: "flex", flexDirection: "row", gap: "16", alignItems: "center" }}>
                                    <Image source={{ uri: item.coverArtUri || "" }} style={{ width: 45, height: 45, borderRadius: 8 }} />
                                    <Text style={globalStyles.text}>{item.name}</Text>
                                </View>
                            </Pressable>
                        )}

                        contentContainerStyle={{
                            gap: 16
                        }}
                        style={{
                            width: "100%"
                        }}
                    />
                </SafeAreaView>
            </Animated.View>
        </View>
    )
}