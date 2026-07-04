import { Platform, Text, ScrollView } from "react-native";
import { globalStyles } from "@/styles/global"
import { SafeAreaView } from "react-native-safe-area-context";

import { useAudioPlayer } from 'expo-audio';

export default function SongsScreen() {
    const player = useAudioPlayer(require('../../assets/SOFT INTENTIONS.m4a'));
    player.play()

    return (
        <SafeAreaView style={[globalStyles.view]}>
            <ScrollView>
                <Text style={globalStyles.text}>Songssssssssssssssssssss</Text>
                <Text style={globalStyles.text}>{Platform.OS}</Text>
            </ScrollView>
        </SafeAreaView>
    );
}
