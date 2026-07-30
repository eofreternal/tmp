import { Pressable, View, Image, Text } from "react-native"
import Entypo from "@react-native-vector-icons/entypo"
import { globalStyles } from "@/styles/global"

import useMusicStore from "@/state/music"

export default function SongComponent({ item, setSelectedSong, setShowThreeDotMenu }: { item: { id: number, name: string, coverArtUri: string | null }, setSelectedSong: (item: { id: number, name: string, coverArtUri: string | null }) => void, setShowThreeDotMenu: (o: boolean) => void }) {
    const musicState = useMusicStore((state) => state)

    return (
        <Pressable
            onPress={async () => {
                musicState.clearQueue()
                await musicState.addSongToQueue(item.id)
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
    )
}