import { View, Pressable, Text, BackHandler } from "react-native"
import { FlashList } from "@shopify/flash-list"
import { SafeAreaView } from "react-native-safe-area-context"
import Animated, { useAnimatedStyle, withTiming, Easing } from "react-native-reanimated"

import { File } from "expo-file-system"

import Lyric, { LineData } from "liricle"
import { useEffect, useRef, useState } from "react"
import { colors, globalStyles } from "@/styles/global"
import useMusicStore from "@/state/music"
import { useAudioPlayerStatus } from "expo-audio"
import Ionicons from "@react-native-vector-icons/ionicons"
import MaterialDesignIcons from "@react-native-vector-icons/material-design-icons"

function ListItem({ item, isCurrent, seekTo }: { item: LineData, isCurrent: boolean, seekTo: (time: number) => void }) {
    const style = useAnimatedStyle(() => {
        return {
            fontSize: withTiming(isCurrent ? 28 : 18, { easing: Easing.out(Easing.quad) }),
            color: withTiming(isCurrent ? colors.accent : colors.mutedLight, { easing: Easing.out(Easing.quad) }),
            fontWeight: isCurrent ? 600 : 400,
        }
    }, [isCurrent])

    return (
        <Pressable onPress={() => {
            seekTo(item.time)
        }}>
            <Animated.Text style={style}>
                {item.text}
            </Animated.Text>
        </Pressable>
    )
}

export default function LyricsComponent({ show, uri, onClose }: { show: boolean, uri: string, onClose: () => void }) {
    const togglePlayPause = useMusicStore((state) => state.togglePlayPause)
    const player = useMusicStore((state) => state.player)
    const musicState = useMusicStore((state) => state)
    const status = useAudioPlayerStatus(player)
    const [currentLyricIndex, setCurrentLyricIndex] = useState(0)
    const [lyrics, setLyrics] = useState<LineData[]>([])
    const [paused, setPaused] = useState(false)

    useEffect(() => {
        setPaused(player.paused)
    }, [player.paused])

    const lrcRef = useRef<Lyric | null>(null)

    useEffect(() => {
        const lastDot = uri.lastIndexOf(".")
        const lrcFile = new File(`${uri.substring(0, lastDot)}.lrc`)
        console.log("Does it exist though:", lrcFile.exists)

        if (lrcFile.exists) {
            const lrc = new Lyric()
            lrcRef.current = lrc

            lrc.on("sync", (line, word) => {
                setCurrentLyricIndex(line!.index!)
                console.log(line, word)
            })

            lrc.load({
                text: lrcFile.textSync()
            })

            setLyrics(lrc.data?.lines || [])
        }
    }, [uri])

    useEffect(() => {
        if (lrcRef.current) {
            lrcRef.current.sync(status.currentTime)
        }
    }, [status.currentTime])

    //TODO: figure out if this is the right way
    useEffect(() => {
        const listener = BackHandler.addEventListener("hardwareBackPress", () => {
            onClose();
            return true;
        })

        return () => listener.remove()
    }, [onClose])

    const animatedStyle = useAnimatedStyle(() => ({
        opacity: withTiming(show ? 1 : 0, { easing: Easing.out(Easing.quad) }),
        transform: [{ translateY: withTiming(show ? 0 : 50, { easing: Easing.out(Easing.quad) }) }]
    }), [show])

    return (
        <View
            pointerEvents="box-none"
            style={{
                position: "absolute",
                top: 0,
                left: 0,
                bottom: 0,
                right: 0,

                zIndex: 100,
                elevation: 100
            }}>
            <Animated.View
                pointerEvents={show ? "auto" : "none"}
                style={[{
                    flex: 1,
                    height: "100%",
                    backgroundColor: colors.background,

                    zIndex: 100
                }, animatedStyle]}>
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
                        }} onPress={() => onClose()}>
                            <Ionicons name="chevron-down-outline" size={24} color="white" />
                        </Pressable>

                        <Text style={[{
                            alignSelf: "center",
                            fontSize: 18,
                            fontWeight: 600
                        }, globalStyles.text]}>Lyrics</Text>

                        <Pressable>
                            <Ionicons name="chevron-down-outline" size={24} color={colors.background} />
                        </Pressable>
                    </View>

                    <FlashList
                        data={lyrics}
                        keyExtractor={(item) => item.time.toString()}
                        style={{
                            width: "100%",
                        }}
                        showsVerticalScrollIndicator={false}

                        renderItem={((item) => (
                            <ListItem item={item.item} isCurrent={item.index == currentLyricIndex} seekTo={(time) => player.seekTo(time)} />
                        ))}

                        contentContainerStyle={{
                            gap: 12
                        }}

                        ListEmptyComponent={() => (
                            <Text style={[{
                                alignSelf: "center"
                            }, globalStyles.text]}>No lyrics</Text>
                        )}
                    />

                    <View style={{
                        display: "flex",
                        flexDirection: "row",
                        justifyContent: "flex-start",
                        paddingTop: 8,
                        gap: 16,
                        width: '100%'
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
                            onPress={() => {
                                setCurrentLyricIndex(-1)
                                musicState.previousSong()
                            }}
                            style={{
                                backgroundColor: colors.tertiary,
                                borderRadius: 50,
                                padding: 13,
                                alignSelf: 'flex-start'
                            }}>
                            <MaterialDesignIcons size={24} name="skip-previous" color={colors.mutedLight} />
                        </Pressable>

                        <Pressable
                            onPress={() => {
                                setCurrentLyricIndex(-1)
                                musicState.nextSong()
                            }}
                            style={{
                                backgroundColor: colors.secondary,
                                borderRadius: 50,
                                padding: 13,
                                alignSelf: 'flex-start'
                            }}>
                            <MaterialDesignIcons size={24} name="skip-next" color={colors.mutedLight} />
                        </Pressable>
                    </View>
                </SafeAreaView>
            </Animated.View>
        </View>
    )
}