import { AudioPlayer, createAudioPlayer } from "expo-audio";
import { create } from "zustand";

export type Song = {
    name: string | undefined
    year: number | undefined
    album: string | undefined
    artwork: string | undefined

    uri: string
}

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
