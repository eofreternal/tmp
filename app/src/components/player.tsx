import { Image, View, Text, Pressable, BackHandler, Platform } from "react-native"
import { FlashList } from "@shopify/flash-list";
import { SafeAreaView } from "react-native-safe-area-context";
import Entypo from "@react-native-vector-icons/entypo";
import Ionicons from "@react-native-vector-icons/ionicons";
import MaterialDesignIcons from "@react-native-vector-icons/material-design-icons";
import Slider from '@react-native-community/slider';

import useMusic from "@/state/music"
import { colors, globalStyles } from "@/styles/global"
import { useAudioPlayerStatus } from "expo-audio";
import { secondsToFormattedText } from "@/util";

import Animated, { withTiming, Easing, useAnimatedStyle } from 'react-native-reanimated';
import { useEffect, useState } from "react";

import PlayerThreeDotMenu from "@/components/playerThreeDotMenu";
import LyricsComponent from "@/components/lyrics"

export default function Player({ isVisible, closeModal }: {
    isVisible: boolean, closeModal: () => void
}) {
    const [showQueue, setShowQueue] = useState(false)
    const [showMenu, setShowMenu] = useState(false)
    const [showLyrics, setShowLyrics] = useState(false)

    const musicState = useMusic((state) => state)
    const togglePlayPause = useMusic((state) => state.togglePlayPause)
    const player = useMusic((state) => state.player)
    const currentSong = useMusic((state) => state.queue[state.currentQueueIndex])
    const queue = useMusic((state) => state.queue)
    const currentQueueIndex = useMusic((state) => state.currentQueueIndex)
    const status = useAudioPlayerStatus(player)

    const [seeking, setSeeking] = useState(false)
    const [seekingTime, setSeekingTime] = useState(0)
    const [paused, setPaused] = useState(false)

    useEffect(() => {
        const listener = BackHandler.addEventListener("hardwareBackPress", () => {
            closeModal();
            return true;
        })

        return () => listener.remove()
    }, [closeModal])

    useEffect(() => {
        // If I don't do this wacky thing and use player.paused directly in the JSX, there will be this weird flickering when the user is seeking
        if (seeking == false) {
            setPaused(player.paused)
            console.log(player.paused)
        }
    }, [player.paused])

    const animatedStyle = useAnimatedStyle(() => ({
        opacity: withTiming(isVisible ? 1 : 0, { duration: 300, easing: Easing.out(Easing.quad) }),
        transform: [{ translateY: withTiming(isVisible ? 0 : 50, { duration: 300, easing: Easing.out(Easing.quad) }) }]
    }), [isVisible])
    const queueAnimatedStyle = useAnimatedStyle(() => ({
        opacity: withTiming(showQueue ? 1 : 0, { duration: 300, easing: Easing.out(Easing.quad) }),
        transform: [{ translateY: withTiming(showQueue ? 0 : 50, { duration: 300, easing: Easing.out(Easing.quad) }) }]
    }), [showQueue])



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

                    zIndex: 100
                }, animatedStyle]}
            >
                <SafeAreaView style={[{
                    display: "flex",
                    flexDirection: "column",
                    flex: 1,

                    alignItems: "center",
                    padding: 16
                }, globalStyles.view]}>
                    <View style={{
                        display: "flex",
                        flexDirection: "row",
                        justifyContent: "space-between",
                        paddingBottom: 16,

                        width: "100%",
                        backgroundColor: colors.background
                    }}>
                        <Pressable style={{
                            display: "flex",
                            flexDirection: "column",

                            alignItems: "flex-start"
                        }} onPress={() => closeModal()}>
                            <Ionicons name="chevron-down-outline" size={24} color="white" />
                        </Pressable>

                        <Text style={[{
                            alignSelf: "center",
                            fontSize: 18,
                            fontWeight: 600
                        }, globalStyles.text]}>Player</Text>

                        <Pressable>
                            <Ionicons name="chevron-down-outline" size={24} color={colors.background} />
                        </Pressable>
                    </View>

                    <View style={{
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "center",
                        alignItems: "center",

                        width: "100%",
                        flex: 1
                    }}>
                        <Image source={{ uri: currentSong.coverArtUri || "" }}
                            style={{
                                aspectRatio: 1,
                                flex: 1,
                                maxWidth: "100%",
                                maxHeight: "100%",
                                borderRadius: 16
                            }}
                            resizeMode="contain"
                        />
                    </View>

                    <View style={{
                        display: "flex",
                        flexDirection: "column",

                        gap: 24
                    }}>
                        <View style={[{
                            display: "flex",
                            flexDirection: "row",
                            justifyContent: "space-between",

                            width: "100%",
                            bottom: 0,

                            flexGrow: 0,
                            flexShrink: 1,

                            alignItems: "center"
                        }]}>
                            <View style={{
                                display: "flex",
                                flexDirection: "column",
                                width: "100%"
                            }}>
                                <View style={{
                                    display: "flex",
                                    flexDirection: "row",
                                    justifyContent: "space-between",

                                    gap: 16,
                                    alignItems: "center"
                                }}>
                                    <Text style={[{
                                        textAlign: "left",

                                        fontSize: 24,
                                        fontWeight: "600"
                                    }, globalStyles.text]}>{currentSong.name}</Text>
                                    <Pressable onPress={() => { setShowMenu(true) }}>
                                        <Entypo name="dots-three-vertical" size={18} color="white" />
                                    </Pressable>
                                </View>

                                <Text style={[{
                                    textAlign: "left",

                                    fontSize: 16,
                                    fontWeight: "600"
                                }, globalStyles.mutedText]}>{(currentSong.artist == undefined) ? "(No Artist)" : currentSong.artist}</Text>
                            </View>
                        </View>

                        <View style={{
                            display: "flex",
                            flexDirection: "column",

                            minWidth: "100%",
                            gap: 36
                        }}>
                            <View style={{
                                display: "flex",
                                flexDirection: "column",

                                minWidth: "100%",
                                gap: 24
                            }}>
                                <View style={{
                                    display: "flex",
                                    flexDirection: "row",
                                    gap: 12
                                }}>
                                    <Pressable
                                        onPress={() => { togglePlayPause() }}
                                        style={{
                                            backgroundColor: colors.accent,
                                            borderRadius: 50,
                                            padding: 16,
                                            alignSelf: 'flex-start'
                                        }}>
                                        {paused ? <Ionicons name="play" size={18} color={colors.background} /> : <Ionicons name="pause" size={18} color={colors.background} />}
                                    </Pressable>

                                    <Pressable
                                        onPress={() => musicState.previousSong()}
                                        style={{
                                            backgroundColor: colors.tertiary,
                                            borderRadius: 50,
                                            padding: 13,
                                            alignSelf: 'flex-start'
                                        }}>
                                        <MaterialDesignIcons size={24} name="skip-previous" color={colors.mutedLight} />
                                    </Pressable>

                                    <Pressable
                                        onPress={() => musicState.nextSong()}
                                        style={{
                                            backgroundColor: colors.secondary,
                                            borderRadius: 50,
                                            padding: 13,
                                            alignSelf: 'flex-start'
                                        }}>
                                        <MaterialDesignIcons size={24} name="skip-next" color={colors.mutedLight} />
                                    </Pressable>
                                </View>

                                <View style={{
                                    display: "flex",
                                    flexDirection: "row",
                                    gap: 8,

                                    alignItems: "center",

                                    maxWidth: 400
                                }}>
                                    <Text style={[globalStyles.text, { width: 35 }]}>{secondsToFormattedText((seeking === false) ? status.currentTime : seekingTime)}</Text>
                                    <View style={{ flex: 1 }}>
                                        <Slider
                                            style={{
                                                marginLeft: Platform.select({ ios: 0, android: -15 }),
                                                marginRight: Platform.select({ ios: 0, android: -15 })
                                            }}
                                            lowerLimit={0}
                                            value={(seeking === false) ? status.currentTime : seekingTime}
                                            maximumValue={status.duration}
                                            minimumTrackTintColor={colors.accent}
                                            thumbTintColor={colors.accent}
                                            maximumTrackTintColor="#FFFFFF"

                                            onValueChange={(e) => {
                                                setSeeking(true)
                                                setSeekingTime(e)
                                            }}

                                            onSlidingComplete={async (e) => {
                                                await player.seekTo(e)
                                                setSeeking(false)
                                            }}
                                        />
                                    </View>
                                    <Text style={[globalStyles.text, { width: 35 }]}>{secondsToFormattedText(status.duration)}</Text>
                                </View>
                            </View>

                            <View style={{
                                display: "flex",
                                flexDirection: "row",
                                justifyContent: "space-between",

                                alignItems: "center"
                            }}>
                                <Pressable onPress={() => setShowQueue(true)} style={{
                                    display: "flex",
                                    flexDirection: "row",
                                    gap: 8,

                                    alignItems: "center"
                                }}>
                                    <Entypo name="list" />
                                    <Text style={globalStyles.accentText}>Playing {currentQueueIndex + 1} of {queue.length}</Text>
                                </Pressable>

                                <View style={{
                                    display: "flex",
                                    flexDirection: "row",

                                    gap: 16
                                }}>
                                    <Pressable onPress={() => {
                                        setShowLyrics(true)
                                    }} style={{
                                        alignItems: "center"
                                    }}>
                                        <Entypo name="text" size={28} color={musicState.loop ? colors.accent : colors.light} />
                                    </Pressable>

                                    <Pressable onPress={() => {
                                        musicState.setLoop(!musicState.loop)
                                    }} style={{
                                        alignItems: "center"
                                    }}>
                                        <Entypo name="loop" size={28} color={musicState.loop ? colors.accent : colors.light} />
                                    </Pressable>
                                </View>
                            </View>
                        </View>
                    </View>
                </SafeAreaView>
            </Animated.View>

            <PlayerThreeDotMenu show={showMenu} songId={currentSong.id} onClose={() => setShowMenu(false)} />
            <LyricsComponent show={showLyrics} uri={currentSong.uri} onClose={() => setShowLyrics(false)} />
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

                        alignItems: "flex-start"
                    }} onPress={() => setShowQueue(false)}>
                        <Ionicons name="chevron-down-outline" size={24} color="white" />
                    </Pressable>
                    <FlashList
                        data={queue}

                        keyExtractor={(data) => data.id.toString()}

                        renderItem={({ item, index }) => (
                            <Pressable
                                onPress={() => {
                                    musicState.playSong(index)
                                }}
                                style={{ display: "flex", flexDirection: "row", marginBottom: 16 }}>
                                <View style={{ display: "flex", flexDirection: "row", gap: "16", alignItems: "center" }}>
                                    <Image source={{ uri: item.coverArtUri || "" }} style={{ width: 45, height: 45, borderRadius: 8 }} />
                                    <Text style={globalStyles.text}>{item.name}</Text>
                                </View>
                            </Pressable>
                        )}

                        style={{
                            width: "100%"
                        }}
                    />
                </SafeAreaView>
            </Animated.View>
        </View>
    )
}