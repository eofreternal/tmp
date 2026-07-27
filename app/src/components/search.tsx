import { useEffect, useState, useMemo, useRef } from "react"
import { Pressable, View, Text, Image, TextInput } from "react-native"
import Animated, { useSharedValue, withTiming, Easing, useAnimatedStyle } from "react-native-reanimated"

import useMusicStore, { Song } from "@/state/music"
import Fuse from "fuse.js"
import { FlashList, FlashListRef } from "@shopify/flash-list"
import { colors, globalStyles } from "@/styles/global"
import Entypo from "@react-native-vector-icons/entypo"
import SongThreeDotMenu from "@/components/songThreeDotMenu"
import { SafeAreaView } from "react-native-safe-area-context"
import Preview from "@/components/preview"
import MaterialDesignIcons from "@react-native-vector-icons/material-design-icons"
import { fetchPlaylists } from "@/util"

import { router } from "expo-router"

const searchCategories = ["songs", "playlists"] as const
type Result = {
    id: number
    name: string,
    coverArtUri: string | null
}

function useDebounce(text: string, delay: number) {
    const [debouncedText, setDebouncedText] = useState(text)

    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedText(text)
        }, delay)

        return () => clearTimeout(timer)
    }, [text, delay])

    return debouncedText
}

export default function SearchComponent({ show, onClose }: { show: boolean, onClose: () => void }) {
    const musicState = useMusicStore((state) => state)
    const songs = useMusicStore((state) => state.songs)
    const [playlists, setPlaylists] = useState<Awaited<ReturnType<typeof fetchPlaylists>>>([])
    useEffect(() => {
        async function temp() {
            setPlaylists(await fetchPlaylists())
        }
        temp()
    })

    const [selectedSearchCategory, setSelectedSearchCategory] = useState<typeof searchCategories[number]>("songs")
    const resultsRef = useRef<FlashListRef<Song>>(undefined)
    const [data, setData] = useState<Result[]>(songs)
    const [result, setResults] = useState<Result[]>([])
    const [searchQuery, setSearchQuery] = useState("")
    const debouncedSearchQuery = useDebounce(searchQuery, 300)

    const search = useMemo(() => new Fuse(data, {
        keys: ["name"],
        threshold: 0.3
    }), [data])

    useEffect(() => {
        if (selectedSearchCategory == "songs") {
            setData(songs)
        } else if (selectedSearchCategory == "playlists") {
            setData(playlists)
        }
    }, [selectedSearchCategory])

    useEffect(() => {
        if (debouncedSearchQuery.trim() == "") {
            resultsRef.current?.scrollToIndex({ index: 0, animated: false })
            setResults([])
            return
        }

        const d = search.search(debouncedSearchQuery)
        setResults(d.map((item) => ({
            id: item.item.id,
            name: item.item.name,
            coverArtUri: item.item.coverArtUri
        })))
        resultsRef.current?.scrollToIndex({ index: 0, animated: false })
    }, [debouncedSearchQuery])

    const opacity = useSharedValue(0)
    const translateY = useSharedValue(0)

    const [selectedSong, setSelectedSong] = useState<Result | null>(null)
    const [showThreeDotMenu, setShowThreeDotMenu] = useState(false)

    useEffect(() => {
        if (show) {
            opacity.value = withTiming(1, { easing: Easing.out(Easing.quad) })
            translateY.value = withTiming(0)
        } else {
            opacity.value = withTiming(0)
            translateY.value = withTiming(50)
        }
    }, [show])

    const animatedStyle = useAnimatedStyle(() => ({
        opacity: opacity.value,
        transform: [{ translateY: translateY.value }]
    }))


    function ResultsListItem({ category, item }: { category: typeof searchCategories[number], item: Result }) {
        if (category == "songs") {
            return (
                <Pressable
                    onPress={async () => {
                        musicState.clearQueue()
                        await musicState.addSongToQueue(item.id)
                        musicState.setCurrentQueueIndex(0)
                        musicState.startPlayer()
                        console.log("ehy")
                    }}
                    style={{
                        display: "flex",
                        flexDirection: "row",
                        marginBottom: 16
                    }}>
                    <View style={{
                        display: "flex",
                        flexDirection: "row",
                        gap: "16",
                        justifyContent: "space-between",
                        width: "100%",
                        alignItems: "center"
                    }}>
                        <View style={{
                            display: "flex",
                            flexDirection: "row",
                            gap: "16",
                            alignItems: "center"
                        }}>
                            <Image source={{ uri: item.coverArtUri || "" }} style={{ width: 45, height: 45, borderRadius: 8 }} />
                            <Text style={globalStyles.text}>{item.name}</Text>
                        </View>
                        <Entypo onPress={() => {
                            setSelectedSong(item)
                            setShowThreeDotMenu(true)
                        }} name="dots-three-vertical" size={16} color="white" />
                    </View>
                </Pressable>
            )
        } else if (category == "playlists") {
            return (
                <Pressable
                    onPress={() => router.navigate({ pathname: "/playlist/[id]", params: { id: item.id } })}

                    style={{
                        display: "flex",
                        flexDirection: "row",
                        marginBottom: 16
                    }}>
                    <View style={{
                        display: "flex",
                        flexDirection: "row",
                        gap: "16",
                        justifyContent: "space-between",
                        width: "100%",
                        alignItems: "center"
                    }}>
                        <View style={{
                            display: "flex",
                            flexDirection: "row",
                            gap: "16",
                            alignItems: "center"
                        }}>
                            <Image source={{ uri: item.coverArtUri || "" }} style={{ width: 45, height: 45, borderRadius: 8 }} />
                            <Text style={globalStyles.text}>{item.name}</Text>
                        </View>
                    </View>
                </Pressable>
            )
        }
    }

    return (
        <SafeAreaView
            pointerEvents="box-none"
            style={{
                position: "absolute",
                top: 0,
                left: 0,
                bottom: 0,
                right: 0,

                zIndex: 98,
                elevation: 98
            }}
        >
            <Animated.View
                pointerEvents={show ? "auto" : "none"}
                style={[{
                    flex: 1,
                    backgroundColor: colors.background,

                    zIndex: 100
                }, animatedStyle]}>
                <View style={{
                    display: "flex",
                    flexDirection: "row",
                    padding: 8,
                    gap: 8,

                    alignItems: "center"
                }}>
                    <Pressable onPress={() => onClose()}>
                        <MaterialDesignIcons name="keyboard-backspace" size={24} color={colors.light} />
                    </Pressable>
                    <TextInput
                        value={searchQuery}
                        onChangeText={(text) => setSearchQuery(text)}
                        autoFocus={true}

                        placeholder="Search your music"
                        placeholderTextColor={colors.light}

                        style={{
                            flex: 1,
                            padding: 8,
                            color: colors.light,
                        }}
                    />
                </View>

                <View style={{
                    width: "100%",

                    borderWidth: 1,
                    borderColor: colors.accent
                }}></View>

                <View style={{
                    display: "flex",
                    flexDirection: "column",

                    flex: 1
                }}>
                    <FlashList
                        data={searchCategories}
                        horizontal={true}

                        renderItem={(({ item }) => (
                            <Pressable style={{
                                paddingLeft: 12,
                                paddingRight: 12,
                                paddingTop: 4,
                                paddingBottom: 4,
                                marginRight: 8,

                                borderWidth: 1,
                                borderColor: selectedSearchCategory == item ? "#374955" : colors.mutedLight,
                                borderRadius: 4,

                                backgroundColor: selectedSearchCategory == item ? "#374955" : colors.background
                            }} onPress={() => {
                                setSelectedSearchCategory(item)
                            }}>
                                <Text style={{ color: "#baccdb", textTransform: "capitalize" }}>{item}</Text>
                            </Pressable>
                        ))}

                        contentContainerStyle={{
                            padding: 8
                        }}
                    />

                    <FlashList
                        ref={resultsRef}
                        data={result}
                        keyExtractor={(item) => item.id.toString()}

                        renderItem={(({ item }) => (<ResultsListItem category={selectedSearchCategory} item={item} />))}

                        contentContainerStyle={{
                            padding: 10
                        }}
                    />
                </View>

                <Preview />
                <SongThreeDotMenu show={showThreeDotMenu} songId={selectedSong?.id} onClose={() => setShowThreeDotMenu(false)} />
            </Animated.View>
        </SafeAreaView >
    )
}