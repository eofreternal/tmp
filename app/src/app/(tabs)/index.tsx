import { Platform, Text, ScrollView, View, Pressable, Image } from "react-native";
import { Link } from 'expo-router';
import { colors, globalStyles } from "@/styles/global"
import { db } from "@/db";
import { useLiveQuery } from "drizzle-orm/expo-sqlite";
import * as schema from "@/db/schema"
import { eq } from "drizzle-orm"
import { useEffect, useState } from "react";
import { Song } from "@/state/music";
import { FlashList } from "@shopify/flash-list";

import useMusicStore from "@/state/music"

function secondsToParsed(seconds: number) {
  const hours = Math.floor(seconds / 3_600) % 3_600
  const minutes = Math.floor(seconds / 60) % 60

  return { hours, minutes }
}

export default function IndexScreen() {
  const musicState = useMusicStore((state) => state)
  const { data: listeningStatRows } = useLiveQuery(db.select().from(schema.timeSpentListeningTable))
  const [aggregatedStats, setAggregatedStats] = useState<(Song & { timeSpentListening: ReturnType<typeof secondsToParsed> })[]>([])
  useEffect(() => {
    async function d() {
      const temp = new Map<number, number>()
      for (const row of listeningStatRows) {
        // this entire thing could be replaced with temp.getOrInsertComputed(row.songId, (amount) => amount + 10)
        // but it was only added to JavaScript in February 2026 so the runtime doesn't support it yet
        const value = temp.get(row.songId)
        if (value == undefined) {
          temp.set(row.songId, 10)
        } else {
          temp.set(row.songId, value + 10)
        }
      }

      const arr = Array.from(temp)
      arr.sort((a, b) => b[1] - a[1])
      const arr2: (Song & { timeSpentListening: ReturnType<typeof secondsToParsed> })[] = []
      for (const item of arr) {
        const [song] = await db.select().from(schema.songsTable).where(eq(schema.songsTable.id, item[0]))
        if (song == undefined) {
          continue
        }

        arr2.push({
          ...song,
          timeSpentListening: secondsToParsed(item[1])
        })
      }
      console.log(JSON.stringify(arr2))
      setAggregatedStats(arr2)
    }
    d()
  }, [listeningStatRows])

  return (
    <View style={[globalStyles.view]}>
      <ScrollView>
        <Text style={globalStyles.text}>Edit src/app/index.tsx to edit this screen.</Text>
        <Text style={globalStyles.text}>{Platform.OS}</Text>
        <Text style={globalStyles.text}>Settings?</Text>
        <Link style={globalStyles.text} href="/settings"><Text style={globalStyles.text}>Go to settingssssss</Text></Link>


        <Link style={globalStyles.text} href="/settings"><Text style={globalStyles.text}>Go to listen together!</Text></Link>

        <View style={{
          display: "flex",
          flexDirection: "column",
          gap: 16
        }}>
          <Text style={{
            fontWeight: 800,
            color: colors.light,
            fontSize: 24
          }}>Stats</Text>
          <FlashList
            data={aggregatedStats}

            renderItem={(({ item }) => (
              <Pressable
                onPress={async () => {
                  musicState.clearQueue()
                  await musicState.addSongToQueue(item.id)
                  musicState.playSong(0)
                }}
                style={{
                  display: "flex",
                  flexDirection: "row",
                  marginBottom: 16
                }}>
                <View style={{
                  display: "flex",
                  flexDirection: "row",
                  gap: "16",
                  justifyContent: "space-between",
                  width: "100%",
                  alignItems: "center",
                }}>
                  <View style={{
                    display: "flex",
                    flexDirection: "row",
                    gap: "16",
                    alignItems: "center"
                  }}>
                    <Image source={{ uri: item.coverArtUri || "" }} style={{ width: 45, height: 45, borderRadius: 8 }} />
                    <Text style={globalStyles.text}>{item.name}</Text>
                  </View>
                  <Text style={[{
                    fontWeight: 600,
                  }, globalStyles.text]}>{item.timeSpentListening.hours} hours {item.timeSpentListening.minutes} minutes</Text>
                </View>
              </Pressable>
            ))}
          />
        </View>
      </ScrollView>
    </View>
  );
}
