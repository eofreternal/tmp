import { Text, VirtualizedList, Pressable, Image, View } from "react-native";
import { globalStyles } from "@/styles/global"

import { BottomSheet, Button, Host } from "@expo/ui"

import useMusic, { Song } from "@/state/music"

import Entypo from "@react-native-vector-icons/entypo";
import { useState } from "react";

export default function SongsScreen() {
    const musicState = useMusic((state) => state)

    const [selectedSong, setSelectedSong] = useState<Song | null>(null)
    const [showThreeDotMenu, setShowThreeDotMenu] = useState(false)

    return (
        <View style={[globalStyles.view]}>
            <VirtualizedList
                initialNumToRender={16}
                data={musicState.songs}
                keyExtractor={(_, index) => index.toString()}
                renderItem={({ item }: { item: typeof musicState.songs[number] }) => (
                    <Pressable
                        onPress={() => {
                            musicState.clearQueue()
                            musicState.addSongToQueue(item)
                            musicState.setCurrentQueueIndex(0)
                            musicState.startPlayer()
                        }}
                        style={{
                            display: "flex",
                            flexDirection: "row"
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
                getItem={(_data, index) => musicState.songs[index]!}
                getItemCount={() => musicState.songs.length}

                ListEmptyComponent={<Text style={globalStyles.text}>No songs</Text>}
                contentContainerStyle={{ gap: "32", padding: 10 }}
            />

            <BottomSheet isPresented={showThreeDotMenu} onDismiss={() => setShowThreeDotMenu(false)}>
                <Button onPress={() => {
                    if (selectedSong === null) {
                        //TODO: throw and error
                        return
                    }
                    musicState.addSongToQueue(selectedSong)
                }} label="Add to queue" />
            </BottomSheet>
        </View>
    );
}
