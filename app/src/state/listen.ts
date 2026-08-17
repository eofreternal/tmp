import { io, Socket } from "socket.io-client"
import { create } from "zustand";
import { router } from "expo-router";

import { getOrSetDeviceId } from "@/util"

import { ServerToClientEvents, ClientToServerEvents, hostActionZodType } from "../../../backend/src/types"

import useMusicStore from "./music";
import { z } from "zod"

const useListenStore = create<{
    socket: Socket<ServerToClientEvents, ClientToServerEvents> | null,
    playingSongHash: string | null,

    rooms: { id: number, name: string }[],
    currentRoom: {
        roomName: string,
        roomId: number | null,
        creator: string,
        songHash: string,
        participants: { id: string, name: string }[],
        songMetadata: {
            name: string
            artist: string
        },
        lastHostAction: z.infer<typeof hostActionZodType> | null
    },

    init: (name: string) => Promise<void>
}>((set, get) => ({
    socket: null,
    playingSongHash: null,

    rooms: [],
    currentRoom: {
        roomName: "",
        roomId: null,
        creator: "",
        participants: [],
        songHash: "",
        songMetadata: {
            artist: "",
            name: ""
        },
        lastHostAction: null
    },

    init: async (name) => {
        const { playingSongHash, socket: socketExists } = get()
        if (socketExists !== null) {
            return
        }

        const socket: Socket<ServerToClientEvents, ClientToServerEvents> = io("10.0.0.38:3008", {
            auth: {
                token: {
                    id: await getOrSetDeviceId(),
                    name: name
                }
            }
        })

        socket.on("update_clients", (data) => {
            set((currentState) => ({ currentRoom: { ...currentState.currentRoom, participants: data } }))
        })

        socket.on("new_room", (data) => {
            console.log("New room", data)
            set((currentState) => ({ rooms: [...currentState.rooms, data] }))
        })

        socket.on("delete_room", (data) => {
            set((currentState) => ({ rooms: currentState.rooms.filter(item => item.id !== data) }))
        })

        socket.on("joined_room", (data) => {
            console.log("Joined room: ", JSON.stringify(data))
            set((currentState) => ({ currentRoom: { ...currentState.currentRoom, roomName: data.name, roomId: data.id } }))
            router.push({
                pathname: "/listen/[id]",
                params: { id: data.id }
            })
        })

        socket.on("room_state", (data) => {
            const player = useMusicStore.getState().player

            if (playingSongHash !== data.lastHostAction.action) {
                player.replace({ uri: `10.0.0.38:3008/song/${data.songHash}` })
                player.seekTo(0)
            }

            switch (data.lastHostAction.action) {
                case "set_song":
                    player.replace({ uri: `10.0.0.38:3008/song/${data.songHash}` })
                    player.seekTo(0)
                    player.play()
                    break;
                case "pause":
                    player.pause()
                    player.seekTo(data.lastHostAction.timeInSong)
                    break;
                case "play":
                    const delay = (Date.now() - data.lastHostAction.unixEpochMs) / 1000
                    player.play()
                    player.seekTo(data.lastHostAction.timeInSong + delay)
                    break;
                case "seek":
                    player.seekTo(data.lastHostAction.timeInSong)
                    break;
                default:
                    // This switch statement should be exhuastive. 
                    // If TypeScript ever complains about this, then that means the switch statement isn't exhaustive
                    data satisfies never;
            }
        })

        socket.on("error", (data) => {
            console.log(data)
        })

        socket.emit("fetch_rooms")
        set(() => ({ socket: socket }))
    }
}))

export { useListenStore }