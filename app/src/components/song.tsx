import { Pressable, View, Image, Text } from "react-native"
import Entypo from "@react-native-vector-icons/entypo"
import { globalStyles } from "@/styles/global"

import useMusicStore from "@/state/music"

export default function SongComponent({ item, set }: {
    item: { id: number, name: string, coverArtUri: string | null }, set: (data: ({
        show: false
        song: null
    }) | ({
        show: true
        song: {
            id: number
            name: string
            coverArtUri: string | null
        }
    })) => void
}) {
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
                <Pressable onPress={() => {
                    set({
                        show: true,
                        song: item
                    })
                }} hitSlop={20}>
                    <Entypo name="dots-three-vertical" size={16} color="white" />
                </Pressable>
            </View>
        </Pressable>
    )
}