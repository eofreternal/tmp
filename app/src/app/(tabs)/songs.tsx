import { Text, VirtualizedList, Pressable, Image, View } from "react-native";
import { globalStyles } from "@/styles/global"
import { SafeAreaView } from "react-native-safe-area-context";

import useMusic from "@/state/music"
import Preview from "@/components/preview";

export default function SongsScreen() {
    const musicState = useMusic((state) => state)

    return (
        <SafeAreaView style={[globalStyles.view]}>
            <VirtualizedList
                initialNumToRender={16}
                data={musicState.songs}
                keyExtractor={(_, index) => index.toString()}
                renderItem={({ item }: { item: typeof musicState.songs[number] }) => (
                    <Pressable onPress={() => musicState.setPlayer(item)} style={{ display: "flex", flexDirection: "row" }}>
                        <View style={{ display: "flex", flexDirection: "row", gap: "16", alignItems: "center" }}>
                            <Image source={{ uri: item.coverArtUri || "" }} style={{ width: 45, height: 45, borderRadius: 8 }} />
                            <Text style={globalStyles.text}>{item.name}</Text>
                            <Text style={globalStyles.text}>{JSON.stringify(item)}</Text>
                        </View>
                    </Pressable>
                )}
                getItem={(_data, index) => musicState.songs[index]!}
                getItemCount={() => musicState.songs.length}

                ListEmptyComponent={<Text style={globalStyles.text}>No songs</Text>}
                contentContainerStyle={{ gap: "32", padding: 10 }}
            />
        </SafeAreaView>
    );
}
