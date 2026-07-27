import { BottomSheet, Button } from "@expo/ui"
import AddToPlaylist from "./addToPlaylist"
import { useState } from "react"
import useMusicStore, { Song } from "@/state/music"

export default function SongThreeDotMenu({ show, songId, onClose }: { show: boolean, songId: number | undefined, onClose: () => void }) {
    const musicState = useMusicStore((state) => state)

    const [showPlaylists, setShowPlaylists] = useState(false)

    return (
        <>
            <BottomSheet isPresented={show} onDismiss={() => onClose}>
                <Button onPress={async () => {
                    if (songId === undefined) {
                        //TODO: throw and error
                        return
                    }
                    await musicState.addSongToQueue(songId)
                }} label="Add to queue" />

                <Button onPress={() => {
                    if (songId === undefined) {
                        //TODO: throw and error
                        return
                    }
                    setShowPlaylists(true)
                }} label="Add to playlist" />
            </BottomSheet>

            <AddToPlaylist show={showPlaylists} songId={songId} onClose={() => setShowPlaylists(false)} />
        </>)
}