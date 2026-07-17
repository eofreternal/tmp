import { AudioPlayer, createAudioPlayer } from "expo-audio";
import { create } from "zustand";
import * as schema from "@/db/schema"
import { InferSelectModel } from "drizzle-orm";

export type Song = InferSelectModel<typeof schema.songsTable>

// export type Playlist = {

// }[]

const useMusicStore = create<{
    showPlayer: boolean,
    player: AudioPlayer,
    songs: Song[],
    // playlists: any[],

    currentlyPlayingSong: Song | null,

    setShowPlayer: (value: boolean) => void,
    addSong: (song: Song) => void
    setPlayer: (song: Song) => void
}>((set, get) => ({
    showPlayer: false,
    player: createAudioPlayer(null, {
        updateInterval: 100
    }),
    songs: [],
    currentlyPlayingSong: null,

    setShowPlayer: (value) => set((_currentState) => ({ showPlayer: value })),
    addSong: (song) => set((currentState) => ({ songs: [...currentState.songs, song] })),
    setPlayer: (song) => {
        const { player } = get()

        player.replace({ uri: song.uri })
        player.play()
        set({ currentlyPlayingSong: song })
    },
}));

export default useMusicStore;
