import { Image, View, Text, Pressable } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context";
import Ionicons from "@react-native-vector-icons/ionicons";

import useMusic from "@/state/music"
import { globalStyles } from "@/styles/global"

export default function Player() {
    const currentSong = useMusic((state) => state.currentlyPlayingSong)

    return (
        <>
            {(currentSong !== null) ?
                <>
                    <SafeAreaView style={[{
                        display: "flex",
                        flexDirection: "column",

                        alignItems: "center"
                    }, globalStyles.view]}>
                        <View style={{
                            display: "flex",
                            flexDirection: "column",
                            justifyContent: "center",
                            alignItems: "center",

                            flexGrow: 1
                        }}>
                            <Image source={{ uri: currentSong.coverArtUri || "" }} style={{
                                width: 350,
                                height: 350,
                                borderRadius: 8
                            }} />
                        </View>
                        <View style={[{
                            display: "flex",
                            flexDirection: "row",

                            width: 350,
                            bottom: 0,

                            flexGrow: 1,
                            flexBasis: 1,
                            flexShrink: 0
                        }]}>
                            <View style={{
                                display: "flex",
                                flexDirection: "column",

                                gap: 8
                            }}>
                                <Text style={[{
                                    textAlign: "left",

                                    fontSize: 20,
                                    fontWeight: "800"
                                }, globalStyles.text]}>{currentSong.name}</Text>
                                <Text style={[{
                                    textAlign: "left",

                                    fontSize: 12,
                                    fontWeight: "800"
                                }, globalStyles.secondaryText]}>Beach Bunny</Text>
                            </View>
                        </View>
                    </SafeAreaView>
                </> : <></>
            }
        </>
    )
}