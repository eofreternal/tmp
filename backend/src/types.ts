import type { InferSelectModel } from "drizzle-orm"
import * as z from "zod"
import * as schema from "./db/schema.js"

export const authInfoZodType = z.object({
    name: z.string(),
    id: z.string()
})

export const createRoomZodType = z.object({
    creatorId: z.string(),
    roomName: z.string()
})

export const deleteRoomZodType = z.object({
    creatorId: z.string(),
    id: z.number()
})

export const joinRoomZodType = z.object({
    roomId: z.number()
})

export const disconnectRoomZodType = z.object({
    roomId: z.number()
})

export const leaveRoomZodType = z.object({
    roomId: z.number()
})

export const allowJoinZodtype = z.object({
    userId: z.string(),
    roomId: z.number()
})

const baseAction = z.object({
    roomId: z.number(),

    timeInSong: z.number(),
    unixEpochMs: z.number()
})

export const hostActionZodType = z.discriminatedUnion("action", [
    baseAction.extend({ action: z.literal("play") }),
    baseAction.extend({ action: z.literal("pause") }),
    baseAction.extend({ action: z.literal("seek") }),

    baseAction.extend({
        action: z.literal("set_song"),
        songHash: z.string(),

        metadata: z.object({
            name: z.string(),
            artist: z.string(),
        })
    })
])


export interface ClientToServerEvents {
    fetch_rooms: () => void;
    create_room: (data: any) => void;
    delete_room: (roomId: any) => void;
    join_room: (data: any) => void;
    disconnect_room: (data: any) => void;
    leave_room: (data: any) => void;

    allow_join: (data: any) => void;

    host_action: (data: any) => void;
}

export interface ServerToClientEvents {
    new_room: (roomData: InferSelectModel<typeof schema.roomsTable>) => void;
    delete_room: (id: number) => void;

    join_request: (data: { id: string, name: string }) => void;
    allowed_user: (data: { roomId: number, userId: string }) => void;

    joined_room: (data: InferSelectModel<typeof schema.roomsTable>) => void;
    update_clients: (data: z.infer<typeof authInfoZodType>[]) => void;

    room_state: (data: RoomState) => void;

    error: (message: string) => void;
}

export interface InterServerEvents { }

export interface SocketData {
    user: { id: string; name: string };
}

export type RoomState = {
    creator: string, songHash: string, songMetadata: {
        name: string
        artist: string
    }, lastHostAction: z.infer<typeof hostActionZodType>
}