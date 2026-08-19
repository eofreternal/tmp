import { io, Socket } from "socket.io-client"
import { create } from "zustand";
import { router } from "expo-router";
import * as schema from "@/db/schema"
import { db } from "@/db/index"
import { eq } from "drizzle-orm"

import * as Crypto from "expo-crypto"
import * as FileSystem from "expo-file-system"

import { getOrSetDeviceId } from "@/util"

import { ServerToClientEvents, ClientToServerEvents, hostActionZodType } from "../../../backend/src/types"

import useMusicStore from "./music";
import { z } from "zod"
import { HostAction } from "@/state/music"

async function getFileHash(uri: string) {
    const file = new FileSystem.File(uri)
    if (file.exists == false) {
        return { success: false, hash: "" };
    }

    const base64 = file.base64Sync()
    const hash = await Crypto.digestStringAsync(Crypto.CryptoDigestAlgorithm.SHA256, base64)
    return { success: false, hash };
}

async function songExists(hash: string) {
    const request = await fetch(`10.0.0.38:3008/song-exists/${hash}`)
    const data = await request.json()

    return data.success as boolean
}

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

    init: (name: string) => Promise<void>,
    uploadSong: (roomId: number, uri: string) => Promise<void>
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
        const { playingSongHash, socket: socketExists, uploadSong, currentRoom } = get()
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

        const subscribeToHostAction = useMusicStore.getState().subscribeToHostAction

        //TODO: write code for this stuff and make it broadcast host action to the backend
        subscribeToHostAction((data: HostAction) => {
            if (data.action !== "play") {
                return
            }
        })
        subscribeToHostAction((data: HostAction) => {
            if (data.action !== "pause") {
                return
            }
        })
        subscribeToHostAction((data: HostAction) => {
            if (data.action !== "seek") {
                return
            }
        })
        subscribeToHostAction((data: HostAction) => {
            if (data.action !== "set_song") {
                return
            }

            if (currentRoom.roomId == null) {
                return
            }

            uploadSong(currentRoom.roomId, data.uri)
        })
    },

    async uploadSong(roomId, uri) {
        const hash = await getFileHash(uri)
        if (hash.success == false) {
            return;
        }

        const exists = await songExists(hash.hash)
        if (exists == true) {
            return
        }

        const formData = new FormData()
        const file = new FileSystem.File(uri)
        formData.append("file", file)

        const [metadata] = await db.select().from(schema.songsTable).where(eq(schema.songsTable.uri, uri))

        if (metadata) {
            if (metadata.coverArtUri) {
                const coverArtFile = new FileSystem.File(metadata.coverArtUri);
                formData.append('coverArt', coverArtFile);
            }

            if (metadata.name) {
                formData.append('metadata', JSON.stringify({
                    name: metadata.name,
                    artist: metadata.artist
                }));
            }
        }

        const deviceId = await getOrSetDeviceId()
        formData.append("roomId", roomId.toString());
        formData.append("creator", deviceId)
        const response = await fetch("http://10.0.0.38:3008/upload-song", {
            method: "POST",
            body: formData,
            headers: {
                Accept: "application/json",
            },
        });
    }

}))

export { useListenStore }