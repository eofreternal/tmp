import { AudioPlayer, createAudioPlayer } from "expo-audio";
import { create } from "zustand";
import * as schema from "@/db/schema"
import { InferSelectModel } from "drizzle-orm";

export type Song = InferSelectModel<typeof schema.songsTable>

const useMusicStore = create<{
    player: AudioPlayer,
    songs: Song[],

    addSong: (song: Song) => void
    setPlayer: (newPlayer: AudioPlayer) => void
}>((set) => ({
    player: createAudioPlayer(null),
    songs: [],

    addSong: (song) => set((currentState) => ({ songs: [...currentState.songs, song] })),
    setPlayer: (newPlayer) => set((_currentState) => ({ player: newPlayer })),
}));

export default useMusicStore;
