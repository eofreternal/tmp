import * as FileSystem from 'expo-file-system';
import AsyncStorage from '@react-native-async-storage/async-storage';

// import {
//     getMetadata as retrieverGetMetadata,
//     saveArtwork as retrieverSaveArtwork,
// } from '@missingcore/react-native-metadata-retriever';
import { getAudioMetadata } from '@missingcore/audio-metadata';

import 'react-native-get-random-values'
import { nanoid } from 'nanoid'

import { db } from "@/db/index"
import * as schema from "@/db/schema"
import { eq } from "drizzle-orm"

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

    return metadata as { artist: string | undefined, albumTitle: string | undefined, title: string | undefined, trackNumber: number | undefined, year: number | undefined }
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

export async function fetchPlaylists() {
    const p = await db.select().from(schema.playlistTable)
    const playlistPopulated: {
        id: number
        name: string
        coverArtUri: string | null
    }[] = []

    p.forEach(async item => {
        const firstSong = await db.query.playlistSongsJunctionTable.findFirst({
            where: {
                playlistId: item.id
            },

            with: {
                songData: true
            },

            orderBy: {
                dateAdded: "asc"
            }
        })
        if (firstSong === undefined) {
            return
        }

        playlistPopulated.push({
            id: item.id,
            name: item.name,
            coverArtUri: firstSong.songData?.coverArtUri || null
        })
    })

    return playlistPopulated
}

export async function fetchAlbums() {
    const albums = (await db.select({ albumTitle: schema.songsTable.albumTitle, coverArt: schema.songsTable.coverArtUri }).from(schema.songsTable))
    const albumsDeduped = Array.from(new Set(albums.map((item) => item.albumTitle)))

    const albumCovers: string[] = []
    albumsDeduped.forEach(async albumName => {
        const [song] = await fetchSongsInAlbum(albumName!)
        if (song !== undefined) {
            albumCovers.push(song.coverArtUri || "")
        }
    })

    const combined: {
        id: number
        name: string
        coverArtUri: string
    }[] = []
    albumsDeduped.forEach((name, i) => {
        combined.push({
            id: i, // this field doesn't actually do anything, it's just to appease search.tsx
            name: name!,
            coverArtUri: albumCovers[i]!
        })
    })

    return combined
}

export async function fetchSongsInAlbum(albumName: string) {
    const allSongs = await db.select().from(schema.songsTable).where(eq(schema.songsTable.albumTitle, albumName));
    const songsWithATrackNumber = []
    const songsWithoutATrackNumber = []

    for (const item of allSongs) {
        if (item.trackNumber !== null) {
            songsWithATrackNumber.push(item)
        } else {
            songsWithoutATrackNumber.push(item)
        }
    }

    songsWithoutATrackNumber.sort((a, b) => a.name.localeCompare(b.name))

    return [...songsWithATrackNumber, ...songsWithoutATrackNumber]
}