import { BottomSheet, Button, Column, Text, Spacer } from "@expo/ui"
import AddToPlaylist from "./addToPlaylist"
import { useState } from "react"
import useMusicStore, { Song } from "@/state/music"

import MaterialDesignIcons from "@react-native-vector-icons/material-design-icons"

import * as Modifer from "@expo/ui/jetpack-compose/modifiers"
import { colors } from "@/styles/global"

export default function SongThreeDotMenu({ show, songId, onClose }: { show: boolean, songId: number | undefined, onClose: () => void }) {
    const musicState = useMusicStore((state) => state)

    const [showPlaylists, setShowPlaylists] = useState(false)

    return (
        <>
            <BottomSheet isPresented={show} onDismiss={() => onClose()}>
                <Column>
                    <Button onPress={async () => {
                        if (songId === undefined) {
                            //TODO: throw and error
                            return
                        }
                        await musicState.addSongToQueue(songId)
                    }} modifiers={[Modifer.fillMaxWidth()]} variant="text">
                        <MaterialDesignIcons name="playlist-music" size={24} color={colors.light} />
                        <Spacer size={16} />
                        <Text textStyle={{ textAlign: "left" }} modifiers={[Modifer.fillMaxWidth()]}>Add to queue</Text>
                    </Button>

                    <Button onPress={() => {
                        if (songId === undefined) {
                            //TODO: throw and error
                            return
                        }
                        setShowPlaylists(true)
                    }} modifiers={[Modifer.fillMaxWidth()]} variant="text" >
                        <MaterialDesignIcons name="playlist-plus" size={24} color={colors.light} />
                        <Spacer size={16} />
                        <Text textStyle={{ textAlign: "left" }} modifiers={[Modifer.fillMaxWidth()]}>Add to playlist</Text>
                    </Button>
                </Column>
            </BottomSheet>

            <AddToPlaylist show={showPlaylists} songId={songId} onClose={() => setShowPlaylists(false)} />
        </>
    )
}