import { SafeAreaView } from "react-native-safe-area-context";

import { Stack } from "expo-router";
import { useListenStore } from "@/state/listen";
import { FlashList } from "@shopify/flash-list";
import { Text, View, Image } from "react-native";
import { colors, globalStyles } from "@/styles/global";

export default function ListenIdPage() {
    const listenStore = useListenStore((state) => state)

    return (
        <SafeAreaView style={[globalStyles.view, {
            padding: 10
        }]}>
            <Stack.Screen options={{
                title: listenStore.currentRoom.roomName,
                headerTintColor: colors.light
            }} />

            <View>
                <View style={{
                    display: "flex",
                    flexDirection: "row",
                    gap: "16",
                    alignItems: "center"
                }}>
                    <Image source={{ uri: `10.0.0.38:3008/cover-art/${listenStore.currentRoom.roomId}/${listenStore.currentRoom.songHash}` }} style={{ width: 45, height: 45, borderRadius: 8 }} />
                    <Text style={globalStyles.text}>{listenStore.currentRoom.songMetadata.name}</Text>
                </View>
            </View>

            <View style={{
                display: "flex",
                flexDirection: "column"
            }}>
                <Text style={[globalStyles.text, {
                    fontWeight: 600,
                    fontSize: 18
                }]}>Participants</Text>
                <FlashList
                    data={listenStore.currentRoom.participants}

                    renderItem={(({ item }) => (
                        <View>
                            <Text>{item.name}</Text>
                        </View>
                    ))}

                    contentContainerStyle={{
                        padding: 10,
                        marginBottom: 16
                    }}
                />
            </View>
        </SafeAreaView>
    )
}