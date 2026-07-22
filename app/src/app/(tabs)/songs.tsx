import { Text, Pressable, Image, View } from "react-native";
import { FlashList } from "@shopify/flash-list"

import { globalStyles } from "@/styles/global"

import { BottomSheet, Button } from "@expo/ui"

import useMusic, { Song } from "@/state/music"

import Entypo from "@react-native-vector-icons/entypo";
import { useState } from "react";
import AddToPlaylist from "@/components/addToPlaylist";

export default function SongsScreen() {
    const musicState = useMusic((state) => state)

    const [selectedSong, setSelectedSong] = useState<Song | null>(null)
    const [showThreeDotMenu, setShowThreeDotMenu] = useState(false)
    const [showPlaylists, setShowPlaylists] = useState(false)

    return (
        <View style={[globalStyles.view]}>
            <FlashList
                data={musicState.songs}
                keyExtractor={(item) => item.id.toString()}
                renderItem={({ item }) => (
                    <Pressable
                        onPress={() => {
                            musicState.clearQueue()
                            musicState.addSongToQueue(item)
                            musicState.setCurrentQueueIndex(0)
                            musicState.startPlayer()
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
                )}

                ListEmptyComponent={<Text style={globalStyles.text}>No songs</Text>}
                contentContainerStyle={{
                    padding: 10
                }}
            />

            <BottomSheet isPresented={showThreeDotMenu} onDismiss={() => setShowThreeDotMenu(false)}>
                <Button onPress={() => {
                    if (selectedSong === null) {
                        //TODO: throw and error
                        return
                    }
                    musicState.addSongToQueue(selectedSong)
                }} label="Add to queue" />

                <Button onPress={() => {
                    if (selectedSong === null) {
                        //TODO: throw and error
                        return
                    }
                    setShowPlaylists(true)
                }} label="Add to playlist" />
            </BottomSheet>

            <AddToPlaylist show={showPlaylists} songId={selectedSong?.id} onClose={() => setShowPlaylists(false)} />
        </View>
    );
}
