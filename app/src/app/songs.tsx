import { Text, FlatList, Pressable, Image } from "react-native";
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
            const everything = Asset.fromModule(require('../../assets/The Happy Fits - Everything You Do.m4a'))
            const asset = Asset.fromModule(require('../../assets/SOFT INTENTIONS.m4a'))
            await asset.downloadAsync()
            await everything.downloadAsync()

            const wantedTags = ['album', 'albumArtist', 'artist', 'name', 'track', 'year', "artwork"] as const;

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
            const w = await getAudioMetadata(everything.localUri!, wantedTags);
            musicState.addSong({ name: data.metadata.name, year: data.metadata.year, album: data.metadata.album, artwork: data.metadata.artwork, uri: asset.localUri! })
            musicState.addSong({ name: w.metadata.name, year: w.metadata.year, album: w.metadata.album, artwork: w.metadata.artwork, uri: everything.localUri! })
        }
        thing()
    }, [])

    return (
        <SafeAreaView style={[globalStyles.view]}>
            <FlatList
                data={musicState.songs}
                keyExtractor={(_, index) => index.toString()}
                renderItem={({ item }) => (
                    <Pressable onPress={() => {
                        musicState.player.replace({ uri: item.uri });
                        musicState.player.play();
                    }}>
                        <Image source={{ uri: item.artwork }} style={{ width: 80, height: 80, borderRadius: 8 }} />
                        <Text style={globalStyles.text}>{item.name}</Text>
                    </Pressable>
                )}

                ListEmptyComponent={<Text style={globalStyles.text}>No songs</Text>}
            />
        </SafeAreaView>
    );
}
