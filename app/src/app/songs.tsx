import { Platform, Text, ScrollView } from "react-native";
import { globalStyles } from "@/styles/global"
import { SafeAreaView } from "react-native-safe-area-context";

import { Asset } from "expo-asset"
import { getAudioMetadata } from '@missingcore/audio-metadata';
import useMusic from "@/state/music"
import { useEffect } from "react";


export default function SongsScreen() {
    const musicState = useMusic((state) => state)

    useEffect(() => {
        async function thing() {
            const asset = Asset.fromModule(require('../../assets/SOFT INTENTIONS.m4a'))
            await asset.downloadAsync()

            const wantedTags = ['album', 'albumArtist', 'artist', 'name', 'track', 'year'] as const;
            console.log(asset.localUri)
            // Of course with `await`, use this inside an async function or use `Promise.then()`.
            const data = await getAudioMetadata(asset.localUri!, wantedTags);
            /*
              Returns:
                {
                  fileType: 'mp3',
                  format: 'ID3v2.3',
                  metadata: {
                      album: 'Void';
                      albumArtist: 'Nothing';
                      artist: 'Nothing';
                      name: 'Silence';
                      track: 1;
                      year: 2024;
                  }
                }
            */
            console.log(data)

            musicState.player.replace({ uri: asset.localUri! })
            musicState.player.play()
        }
        thing()
    }, [])

    return (
        <SafeAreaView style={[globalStyles.view]}>
            <ScrollView>
                <Text style={globalStyles.text}>Songssssssssssssssssssss</Text>
                <Text style={globalStyles.text}>{Platform.OS}</Text>
            </ScrollView>
        </SafeAreaView>
    );
}
