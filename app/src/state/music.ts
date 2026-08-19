import { AudioPlayer, createAudioPlayer } from "expo-audio";
import { create } from "zustand";
import * as schema from "@/db/schema"
import { InferSelectModel } from "drizzle-orm";
import { db } from "@/db";

export type HostAction =
    {
        action: "play",
        time: number,
        unixEpochMs: number
    } | {
        action: "pause",
        time: number,
        unixEpochMs: number
    } | {
        action: "seek",
        time: number,
        unixEpochMs: number
    } | {
        action: "set_song",
        uri: string,
        unixEpochMs: number
    }

export type Song = InferSelectModel<typeof schema.songsTable>

const setupPlayer = (get: () => any) => {
    const player = createAudioPlayer(null, {
        updateInterval: 100
    })

    let timeOfLastUpdate = Date.now()
    player.addListener("playbackStatusUpdate", async (status) => {
        const { loop, nextSong, queue, currentQueueIndex } = get()
        if (status.didJustFinish) {
            if (loop) {
                player.seekTo(0)
            } else {
                nextSong()
            }
        }

        if ((Date.now() - timeOfLastUpdate) >= 10_000) {
            if (player.paused == false) {
                const song = queue[currentQueueIndex]
                if (song == undefined) {
                    return
                }

                await db.insert(schema.timeSpentListeningTable).values({
                    songId: song.id,
                    dateAdded: new Date()
                })

                timeOfLastUpdate = Date.now()
            }
        }
    })

    return player
}

const listeners = new Set<(data: HostAction) => void>()

function notifyListeners(action: HostAction) {
    listeners.forEach(cb => {
        cb(action)
    })
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
    addSongToQueue: (songId: number) => Promise<void>,
    setCurrentQueueIndex: (index: number) => void,

    playSong: (index: number) => void,
    resumePlayer: () => void,
    pausePlayer: () => void,
    togglePlayPause: () => void,

    nextSong: () => void,
    previousSong: () => void,
    setLoop: (loop: boolean) => void,

    //Stuff for the socket
    subscribeToHostAction: (cb: (data: HostAction) => void) => (() => void)
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
    addSongToQueue: async (songId) => {
        const songData = await db.query.songsTable.findFirst({
            where: {
                id: songId
            }
        })

        if (songData === undefined) {
            //TODO: throw error or something
            return
        }

        return set((currentState) => ({ queue: [...currentState.queue, songData] }))
    },
    setCurrentQueueIndex: (index) => set((currentState) => ({ currentQueueIndex: index })),

    playSong: async (index) => {
        const { player, queue, } = get()

        const song = queue[index]
        if (song === undefined) {
            return
        }

        player.replace({ uri: song.uri })
        player.play()
        set(() => ({ currentQueueIndex: index }))
        notifyListeners({
            action: "set_song",
            uri: song.uri,
            unixEpochMs: Date.now()
        })
    },

    resumePlayer: () => {
        const { player, queue, currentQueueIndex, playSong } = get()

        // There's a slight bit of inaccuracy between the currentTime and the duration of the song
        // If they're about a 200ms apart, just consider it the ending of the song and loop it when the user presses the "start" button
        const difference = Math.abs(player.duration - player.currentTime)
        if (difference < 0.2) {
            if (queue.length == currentQueueIndex) {
                playSong(0)
                return
            }
        }

        player.play()
        notifyListeners({
            action: "play",
            time: player.currentTime,
            unixEpochMs: Date.now()
        })
    },
    pausePlayer: () => {
        const { player } = get()

        player.pause()
        notifyListeners({
            action: "pause",
            time: player.currentTime,
            unixEpochMs: Date.now()
        })
    },
    togglePlayPause: () => {
        const { player, resumePlayer, pausePlayer } = get()

        if (player.paused) {
            resumePlayer()
            return
        }

        pausePlayer()
    },

    nextSong: () => {
        const { playSong, currentQueueIndex } = get()

        playSong(currentQueueIndex + 1)
    },
    previousSong: () => {
        const { playSong, currentQueueIndex } = get()

        playSong(currentQueueIndex - 1)
    },
    setLoop: (loop: boolean) => set((_currentState) => ({ loop: loop })),

    //Stuff for the socket
    subscribeToHostAction: (cb) => {
        listeners.add(cb)

        return () => listeners.delete(cb)
    }
}));

export default useMusicStore;
