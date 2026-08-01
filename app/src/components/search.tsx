import { useEffect, useState, useMemo, useRef } from "react"
import { Pressable, View, Text, Image, TextInput, Keyboard } from "react-native"
import Animated, { useSharedValue, withTiming, Easing, useAnimatedStyle } from "react-native-reanimated"

import useMusicStore, { Song } from "@/state/music"
import Fuse from "fuse.js"
import { FlashList, FlashListRef } from "@shopify/flash-list"
import { colors, globalStyles } from "@/styles/global"
import SongThreeDotMenu from "@/components/songThreeDotMenu"
import { SafeAreaView } from "react-native-safe-area-context"
import Preview from "@/components/preview"
import MaterialDesignIcons from "@react-native-vector-icons/material-design-icons"
import { fetchAlbums, fetchPlaylists } from "@/util"
import SongComponent from "@/components/song"

import { router } from "expo-router"

const searchCategories = ["songs", "albums", "playlists"] as const
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
    const songs = useMusicStore((state) => state.songs)
    const [playlists, setPlaylists] = useState<Awaited<ReturnType<typeof fetchPlaylists>>>([])
    const [albums, setAlbums] = useState<Awaited<ReturnType<typeof fetchAlbums>>>([])
    useEffect(() => {
        async function temp() {
            setPlaylists(await fetchPlaylists())
            setAlbums(await fetchAlbums())
        }
        temp()
    }, [])

    const [selectedSearchCategory, setSelectedSearchCategory] = useState<typeof searchCategories[number]>("songs")
    const searchInput = useRef<TextInput>(null)
    const resultsRef = useRef<FlashListRef<Result>>(null)
    const data = useMemo(() => {
        if (selectedSearchCategory == "songs") {
            return songs
        } else if (selectedSearchCategory == "playlists") {
            return playlists
        } else {
            return albums
        }
    }, [selectedSearchCategory])
    const [results, setResults] = useState<Result[]>([])
    const [searchQuery, setSearchQuery] = useState("")
    const [threeDotMenu, setThreeDotMenu] = useState<({
        show: false
        song: null
    }) | ({
        show: true
        song: {
            id: number
            name: string
            coverArtUri: string | null
        }
    })>({
        show: false,
        song: null
    })
    const debouncedSearchQuery = useDebounce(searchQuery, 300)
    const search = useMemo(() => new Fuse(data, {
        keys: ["name"],
        threshold: 0.3
    }), [data])

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
    }, [debouncedSearchQuery, search])

    const opacity = useSharedValue(0)
    const translateY = useSharedValue(0)

    useEffect(() => {
        if (show) {
            opacity.value = withTiming(1, { easing: Easing.out(Easing.quad) })
            translateY.value = withTiming(0)

            searchInput.current?.focus()
        } else {
            opacity.value = withTiming(0)
            translateY.value = withTiming(50)

            Keyboard.dismiss()
        }
    }, [show])

    const animatedStyle = useAnimatedStyle(() => ({
        opacity: opacity.value,
        transform: [{ translateY: translateY.value }]
    }))


    function ResultListItem({ category, item }: { category: typeof searchCategories[number], item: Result }) {
        if (category == "songs") {
            return (
                <SongComponent item={item} set={(data) => setThreeDotMenu(data)} />
            )
        } else if (category == "playlists") {
            return (
                <Pressable
                    onPress={() => {
                        router.navigate({ pathname: "/playlist/[id]", params: { id: item.id } })
                        onClose()
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
                    </View>
                </Pressable>
            )
        } else if (category == "albums") {
            return (
                <Pressable
                    onPress={() => {
                        router.navigate({ pathname: "/album/[name]", params: { name: item.name } })
                        onClose()
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
                        ref={searchInput}
                        value={searchQuery}
                        onChangeText={(text) => setSearchQuery(text)}

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
                        data={results}
                        keyExtractor={(item) => `${selectedSearchCategory}-${item.id.toString()}`}

                        renderItem={(({ item }) => (<ResultListItem category={selectedSearchCategory} item={item} />))}

                        contentContainerStyle={{
                            padding: 10
                        }}
                    />
                </View>

                <Preview />
                <SongThreeDotMenu show={threeDotMenu.show} songId={threeDotMenu.show ? threeDotMenu.song.id : undefined} onClose={() => setThreeDotMenu({ show: false, song: null })} />
            </Animated.View>
        </SafeAreaView >
    )
}