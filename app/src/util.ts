import * as FileSystem from 'expo-file-system';
import AsyncStorage from '@react-native-async-storage/async-storage';

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

export function handleCoverArt(filename: string, thumbnail: string | undefined) {
    if (thumbnail) {
        const imageData = thumbnail.split(",")[1]!
        const fileExtension = thumbnail.split("/")[1]!.split(";")[0]!
        const decodedBase64 = atob(imageData)

        const bytes = new Uint8Array(decodedBase64.length)
        for (let i = 0; i < decodedBase64.length; i++) {
            bytes[i] = decodedBase64.charCodeAt(i)
        }

        const imageFile = new FileSystem.File(FileSystem.Paths.document, `${filename.replaceAll("[", "").replaceAll("]", "")}.${fileExtension}`)
        imageFile.create({ overwrite: true })
        imageFile.write(bytes)
        return imageFile.uri
    }

    return undefined
}