import { Stack } from 'expo-router';

import * as FileSystem from "expo-file-system"
import { useEffect, useState } from "react";
import { db } from "@/db/index"
import * as schema from "@/db/schema"
import { useMigrations } from "drizzle-orm/expo-sqlite/migrator";
import migrations from "../../drizzle/migrations"
import { getMetadata, getOrRequestMusicFolder, saveArtwork } from "@/util";

import { eq, InferInsertModel } from "drizzle-orm"
import useMusic from "@/state/music"
import useOtherState from '@/state/otherState';

import * as SplashScreen from 'expo-splash-screen';
import Player from '@/components/player';
import Search from "@/components/search"

import { LogBox } from 'react-native';
import { colors } from '@/styles/global';
LogBox.ignoreAllLogs();

SplashScreen.preventAutoHideAsync();

let songsInDb: { uri: string, lastModified: Date }[] = []
async function handleFile(file: FileSystem.File) {
  //TODO: add more file formats
  if ([".m4a", ".mp3"].includes(file.extension) === false) {
    return
  }

  const start = performance.now()
  const [song] = songsInDb.filter(song => song.uri === file.uri)
  console.log(`Fetching db for ${file.name} took ${performance.now() - start} milliseconds. Result: ${song}`)
  if ((song === undefined) || (song.lastModified.getTime() !== file.lastModified!)) {
    const start = performance.now()
    const metadata = await getMetadata(file.uri);
    const coverArt = await saveArtwork(file.uri);
    console.log(coverArt)
    console.log(`Fetching metadata for ${file.name} took ${performance.now() - start} milliseconds`)
    const data = {
      name: metadata.title || file.name.substring(0, file.name.lastIndexOf(".")),
      uri: file.uri,
      artist: metadata.artist,
      coverArtUri: coverArt,
      year: metadata.year,

      albumTitle: metadata.albumTitle,
      trackNumber: metadata.trackNumber,

      lastModified: new Date(file.lastModified!)
    } satisfies InferInsertModel<typeof schema.songsTable>

    if (song === undefined) {
      await db.insert(schema.songsTable).values(data)
    } else {
      await db.update(schema.songsTable).set(data).where(eq(schema.songsTable.name, file.name))
    }
  }
  console.log(`Done processing ${file.name}`)
}

export default function Layout() {
  const musicState = useMusic((state) => state)
  const { success, error } = useMigrations(db, migrations);

  const showSearch = useOtherState((state) => state.search)
  const setSearch = useOtherState((state) => state.setSearch)

  useEffect(() => {
    if (success === false) {
      return
    }

    async function main() {
      songsInDb = await db.select({ uri: schema.songsTable.uri, lastModified: schema.songsTable.lastModified }).from(schema.songsTable)

      // const process = []
      const uri = await getOrRequestMusicFolder()
      const directory = new FileSystem.Directory(uri)
      const list = directory.list()
      let idx = 0
      for (const i of list) {
        if (i instanceof FileSystem.File) {
          // process.push(handleFile(i))
          console.log(`${idx} / ${list.length}`)
          await handleFile(i)
          idx++
        }
      }

      // await Promise.allSettled(process)

      const allSongs = await db.select().from(schema.songsTable)
      allSongs.sort((a, b) => a.name.localeCompare(b.name))
      for (const song of allSongs) {
        //clean up old songs that don't exist anymore. Maybe the user deleted the song or something
        const testingFile = new FileSystem.File(song.uri)
        if (testingFile.exists === false) {
          await db.delete(schema.songsTable).where(eq(schema.songsTable.id, song.id))
          continue
        }

        musicState.addSong(song)
      }
      SplashScreen.hide();
    }
    main()
  }, [success])

  return (
    <>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />

        <Stack.Screen name="settings" options={{ title: 'Settings', headerStyle: { backgroundColor: colors.background }, headerTitleStyle: { color: colors.light }, headerTitleAlign: "center" }} />

        <Stack.Screen name="playlist/[id]" options={{ title: 'Loading...', headerStyle: { backgroundColor: colors.background }, headerTitleAlign: "center" }} />
        <Stack.Screen name="album/[name]" options={{ title: 'Loading...', headerStyle: { backgroundColor: colors.background }, headerTitleAlign: "center" }} />
      </Stack>

      <Search show={showSearch} onClose={() => setSearch(false)} />
      <Player isVisible={musicState.showPlayer} closeModal={() => { musicState.setShowPlayer(false) }} /></>
  );
}