import { Tabs } from "expo-router";
import { colors } from "@/styles/global"
import Ionicons from "@react-native-vector-icons/ionicons";
import Entypo from "@react-native-vector-icons/entypo";
import * as FileSystem from "expo-file-system"
import { useEffect } from "react";
import { db } from "@/db/index"
import * as schema from "@/db/schema"
import { useMigrations } from "drizzle-orm/expo-sqlite/migrator";
import migrations from "../../drizzle/migrations"
import { getOrRequestMusicFolder, handleCoverArt } from "@/util";
import { getAudioMetadata } from '@missingcore/audio-metadata';
import { eq } from "drizzle-orm"
import useMusic from "@/state/music"

const wantedTags = ['album', 'albumArtist', 'artist', 'name', 'track', 'year', "artwork"] as const;
async function handleFile(file: FileSystem.File) {
  console.log(file.name)
  if ([".m4a", ".mp3"].includes(file.extension) === false) {
    return
  }

  const [song] = await db.select().from(schema.songsTable).where(eq(schema.songsTable.name, i.name))
  if (song === undefined) {
    const metadata = await getAudioMetadata(file.uri, wantedTags)
    const coverArt = handleCoverArt(file.name, metadata.metadata.artwork)
    console.log(coverArt)
    await db.insert(schema.songsTable).values({
      name: file.name,
      uri: file.uri,
      coverArtUri: coverArt,

      lastModified: new Date(file.lastModified!)
    })
  } else {
    if (song.lastModified.getTime() !== file.lastModified!) {
      const metadata = await getAudioMetadata(file.uri, wantedTags)
      const coverArt = handleCoverArt(file.name, metadata.metadata.artwork)
      await db.update(schema.songsTable).set({
        name: file.name,
        uri: file.uri,
        coverArtUri: coverArt,

        lastModified: new Date(file.lastModified!)
      }).where(eq(schema.songsTable.name, file.name))
    }
  }
}

export default function RootLayout() {
  const musicState = useMusic((state) => state)
  useMigrations(db, migrations);

  useEffect(() => {
    async function main() {
      //TODO: clean up old songs that aren't in the music folder anymroe
      const process = []
      const uri = await getOrRequestMusicFolder()
      const directory = new FileSystem.Directory(uri)
      const list = directory.list()
      for (const i of list) {
        if (i instanceof FileSystem.File) {
          process.push(handleFile(i))
        }
      }

      await Promise.allSettled(process)

      console.log("all songs")
      const allSongs = await db.select().from(schema.songsTable)
      console.log(allSongs)
      for (const song of allSongs) {
        console.log(song)
        musicState.addSong(song)
      }
    }
    main()
  }, [])

  return (
    <>
      <Tabs screenOptions={{
        tabBarStyle: {
          backgroundColor: "#1d1d1d"
        },

        tabBarInactiveTintColor: "#c1c7ce",

        headerStyle: {
          backgroundColor: colors.background
        },
        headerTintColor: colors.text,
        headerTitleAlign: "center",
      }}>
        <Tabs.Screen name="index" options={{
          title: "Home",
          tabBarIcon: ({ color, size }) => (<Ionicons name="musical-note" size={size} color={color} />)
        }} />
        <Tabs.Screen name="songs" options={{
          title: "Songs",
          tabBarIcon: ({ color, size }) => (<Entypo name="home" size={size} color={color} />)
        }} />
      </Tabs>
    </>
  );
}
