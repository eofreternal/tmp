import { AudioPlayer, createAudioPlayer } from "expo-audio";
import { create } from "zustand";
import * as schema from "@/db/schema"
import { InferSelectModel } from "drizzle-orm";

export type Song = InferSelectModel<typeof schema.songsTable>

const setupPlayer = (get: () => any) => {
    const player = createAudioPlayer(null, {
        updateInterval: 100
    })

    player.addListener("playbackStatusUpdate", (status) => {
        if (status.didJustFinish) {
            const { loop, nextSong } = get()
            if (loop) {
                player.seekTo(0)
            } else {
                nextSong()
            }
        }
    })

    return player
}

const useMusicStore = create<{
    showPlayer: boolean,
    loop: boolean,
    player: AudioPlayer,
    songs: Song[],
    queue: Song[],
    currentQueueIndex: number,

    setShowPlayer: (value: boolean) => void,
    addSong: (song: Song) => void

    clearQueue: () => void,
    addSongToQueue: (song: Song) => void,
    setCurrentQueueIndex: (index: number) => void,

    startPlayer: () => void,
    stopPlayer: () => void,

    nextSong: () => void,
    previousSong: () => void,
    setLoop: (loop: boolean) => void
}>((set, get) => ({
    showPlayer: false,
    loop: false,
    player: setupPlayer(get),
    songs: [],
    queue: [],
    currentQueueIndex: 0,

    setShowPlayer: (value) => set((_currentState) => ({ showPlayer: value })),
    addSong: (song) => set((currentState) => ({ songs: [...currentState.songs, song] })),

    clearQueue: () => set((_currentState) => ({ queue: [], currentQueueIndex: 0 })),
    addSongToQueue: (song) => set((currentState) => ({ queue: [...currentState.queue, song] })),
    setCurrentQueueIndex: (index) => set((currentState) => ({ currentQueueIndex: index })),

    startPlayer: () => {
        const { player, queue, currentQueueIndex } = get()

        const song = queue[currentQueueIndex]
        if (song === undefined) {
            return
        }

        player.replace({ uri: song.uri })
        player.play()
    },
    stopPlayer: () => {
        const { player } = get()

        player.pause()
    },

    nextSong: () => {
        const { player, queue, currentQueueIndex } = get()

        const song = queue[currentQueueIndex + 1]
        if (song === undefined) {
            return
        }

        player.replace({ uri: song.uri })
        player.play()
        set((currentState) => ({ currentQueueIndex: currentState.currentQueueIndex + 1 }))
    },
    previousSong: () => {
        const { player, queue, currentQueueIndex } = get()

        const song = queue[currentQueueIndex - 1]
        if (song === undefined) {
            return
        }

        player.replace({ uri: song.uri })
        player.play()
        set((currentState) => ({ currentQueueIndex: currentState.currentQueueIndex - 1 }))
    },
    setLoop: (loop: boolean) => set((_currentState) => ({ loop: loop }))
}));

export default useMusicStore;
