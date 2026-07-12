import * as FileSystem from 'expo-file-system';
import AsyncStorage from '@react-native-async-storage/async-storage';

// import {
//     getMetadata as retrieverGetMetadata,
//     saveArtwork as retrieverSaveArtwork,
// } from '@missingcore/react-native-metadata-retriever';
import { getAudioMetadata } from '@missingcore/audio-metadata';

import 'react-native-get-random-values'
import { nanoid } from 'nanoid'

const MUSIC_FOLDER = 'music_folder';

export async function getOrRequestMusicFolder() {
    const savedUri = await AsyncStorage.getItem(MUSIC_FOLDER);

    if (savedUri) {
        return savedUri
    }

    const directory = await FileSystem.Directory.pickDirectoryAsync()
    await AsyncStorage.setItem(MUSIC_FOLDER, directory.uri);
    return directory.uri
};

export async function getMetadata(uri: string) {
    // MARK: uncomment for prod
    // return await retrieverGetMetadata(uri, ['artist', 'albumArtist', 'albumTitle', 'title', 'trackNumber', 'year']);



    const { metadata } = await getAudioMetadata(uri, ['artist', 'albumArtist', "album", 'name', 'track', 'year',])
    //@ts-expect-error
    metadata["albumTitle"] = metadata["album"]
    //@ts-expect-error
    metadata["title"] = metadata["name"]
    //@ts-expect-error
    metadata["trackNumber"] = metadata["track"]

    return metadata as { artist: string, albumTitle: string, title: string, trackNumber: number, year: number }
}

export async function saveArtwork(uri: string) {
    // MARK: uncomment for prod
    // return await retrieverSaveArtwork(uri);

    const { metadata } = await getAudioMetadata(uri, ["artwork"])

    if (metadata.artwork) {
        const imageData = metadata.artwork.split(",")[1]!
        const fileExtension = metadata.artwork.split("/")[1]!.split(";")[0]!
        const decodedBase64 = atob(imageData)

        const bytes = new Uint8Array(decodedBase64.length)
        for (let i = 0; i < decodedBase64.length; i++) {
            bytes[i] = decodedBase64.charCodeAt(i)
        }

        const uuid = nanoid()
        const imageFile = new FileSystem.File(FileSystem.Paths.document, `${uuid}.${fileExtension}`)
        imageFile.create({ overwrite: true })
        imageFile.write(bytes)
        return imageFile.uri
    }

    return undefined
}

export function secondsToFormattedText(time: number) {
    const seconds = (parseInt(time.toString()) % 60).toString().padStart(2, "0")
    const minutes = parseInt((time / 60).toString())

    return `${minutes}:${seconds}`
}