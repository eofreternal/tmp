import { db } from "@/db";
import * as schema from "@/db/schema"
import { globalStyles } from "@/styles/global";
import { useLiveQuery } from "drizzle-orm/expo-sqlite";
import { Image, Text, FlatList, View } from "react-native"
import { Link } from "expo-router";

export default function AlbumsPage() {
    const albums = Array.from(new Set(useLiveQuery(db.select({ albumTitle: schema.songsTable.albumTitle }).from(schema.songsTable)).data.map((item) => item.albumTitle).filter(item => item !== null)))

    return (
        <View style={[globalStyles.view]}>
            <FlatList
                data={albums}
                keyExtractor={(album) => album}

                renderItem={({ item }) => (
                    <Link href={{ pathname: "/album/[name]", params: { name: item } }} style={[globalStyles.text, {
                        display: "flex",
                        flexDirection: "row",
                        gap: 8,

                        alignItems: "center"
                    }]}>
                        <Image source={{ uri: "" }} style={{ width: 45, height: 45, borderRadius: 8 }} />
                        <Text style={globalStyles.text}>{item}</Text>
                    </Link>
                )
                }
            />
        </View >
    )
}