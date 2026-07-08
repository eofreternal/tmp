import { AudioPlayer, createAudioPlayer } from "expo-audio";
import { create } from "zustand";
import * as schema from "@/db/schema"
import { InferSelectModel } from "drizzle-orm";

export type Song = InferSelectModel<typeof schema.songsTable>

const useMusicStore = create<{
    player: AudioPlayer,
    songs: Song[],

    currentlyPlayingSong: Song | null,

    addSong: (song: Song) => void
    setPlayer: (song: Song) => void
}>((set, get) => ({
    player: createAudioPlayer(null),
    songs: [],
    currentlyPlayingSong: null,

    addSong: (song) => set((currentState) => ({ songs: [...currentState.songs, song] })),
    setPlayer: (song) => {
        const { player } = get()

        player.replace({ uri: song.uri })
        player.play()
        set({ currentlyPlayingSong: song })
    },
}));

export default useMusicStore;
