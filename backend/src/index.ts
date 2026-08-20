import { serve } from '@hono/node-server'
import { Hono } from 'hono'
import { Server } from "socket.io"
import { db } from "./db/index.js"
import * as schema from "./db/schema.js"
import { eq, and } from "drizzle-orm"
import { zValidator } from "@hono/zod-validator"
import { stream } from 'hono/streaming'
import path from "path"
import crypto from "crypto"

import { fileTypeFromBuffer } from 'file-type';

import { createRoomZodType, deleteRoomZodType, authInfoZodType, joinRoomZodType, allowJoinZodtype, disconnectRoomZodType, hostActionZodType, leaveRoomZodType } from "./types.js"
import type { ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData, RoomState } from "./types.js"
import * as z from "zod"
import fs from "fs/promises"
import { createReadStream } from 'fs'

const app = new Hono()
const joinRequests = new Array<{ creator: string, roomId: number, user: { id: string, name: string } }>()

app.get('/', (c) => {
    return c.text('Hello Hono!')
})

const uploadSongZodType = z.object({
    file: z.instanceof(File).refine((f) => f.type.startsWith("audio")),
    coverArt: z.instanceof(File).optional(),
    roomId: z.number(),
    creator: z.string(),

    metadata: z.string()
})

const metadataZod = z.object({
    name: z.string(),
    artist: z.string()
})

app.post("/upload-song", async (c) => {
    const body = await c.req.parseBody()
    const bodyParsed = uploadSongZodType.safeParse(body)
    if (bodyParsed.success == false) {
        return c.json({ success: false, message: "Something went wrong while parsing request" }, 400)
    }

    //TODO: actually check the mime type to insure its a music file
    const file = bodyParsed.data.file
    const fileBytes = await file.bytes()
    const coverArtFile = bodyParsed.data.coverArt
    const roomId = bodyParsed.data.roomId
    const metadata = JSON.parse(bodyParsed.data.metadata)
    const metadataParsed = metadataZod.safeParse(metadata)
    if (metadataParsed.success == false) {
        return c.json({ success: false, message: "Metadata parse failed" }, 400)
    }

    if (typeof file == "string") {
        return c.json({ success: false, message: "File is a string, not a File. Why?" }, 400)
    }

    const mimeType = await fileTypeFromBuffer(fileBytes)
    if (mimeType == undefined || mimeType.mime.startsWith("audio") == false) {
        return c.json({ success: false, message: "Wrong mime type bucko" }, 400)
    }

    const [room] = await db.select().from(schema.roomsTable).where(eq(schema.roomsTable.id, roomId))
    if (room == undefined) {
        return c.json({ success: false, message: "Wrong room id" }, 400)
    }
    if (room.creator !== bodyParsed.data.creator) {
        return c.json({ success: false, message: `You're not the creator of room ${roomId}!` }, 400)
    }

    const sha256 = crypto.createHash("sha256").update(fileBytes).digest("hex")
    const uploadDir = path.join(process.cwd(), "uploads", roomId.toString())

    let coverArt: { bytes: Uint8Array<ArrayBuffer>, sha256Hash: string } | { bytes: null, sha256Hash: null } = { bytes: null, sha256Hash: null }
    if (coverArtFile !== undefined) {
        coverArt = {
            bytes: await coverArtFile.bytes(),
            sha256Hash: crypto.createHash("sha256").update(await coverArtFile.bytes(),).digest("hex")
        }
    }

    await db.insert(schema.uploadedSongsTable).values({
        hash: sha256,
        coverArtName: coverArt.sha256Hash,
        roomId: room.id,
        mimeType: mimeType.mime,

        name: metadataParsed.data.name,
        artist: metadataParsed.data.artist,

        creationDate: new Date()
    })

    await fs.mkdir(uploadDir, { recursive: true })
    await fs.writeFile(path.join(uploadDir, sha256), fileBytes)
    if (coverArt.bytes) {
        await fs.writeFile(path.join(uploadDir, coverArt.sha256Hash), coverArt.bytes)
    }

    return c.json({ success: true }, 201)
})

app.get("/song/:hash", async (c) => {
    const hash = c.req.param("hash")

    const [song] = await db.select().from(schema.uploadedSongsTable).where(eq(schema.uploadedSongsTable.hash, hash))
    if (song == undefined) {
        return c.json({ success: false, message: "Song doesn't exist" }, 400)
    }

    const uploadDir = path.join(process.cwd(), "uploads", song.roomId.toString())
    const filePath = path.join(uploadDir, song.hash)
    const stat = await fs.stat(filePath)

    c.header("Content-Length", stat.size.toString())
    c.header("Content-Type", song.mimeType)

    return stream(c, async (stream) => {
        const readStream = createReadStream(filePath)
        for await (const chunk of readStream) {
            await stream.write(chunk)
        }
    })
})

app.get("/song-exists/:hash", async (c) => {
    const hash = c.req.param("hash")

    const [song] = await db.select().from(schema.uploadedSongsTable).where(eq(schema.uploadedSongsTable.hash, hash))
    if (song == undefined) {
        return c.json({ success: false, message: "Song doesn't exist" }, 400)
    }

    return c.json({ success: true, message: "Song exist" }, 400)
})

const server = serve({
    fetch: app.fetch,
    port: 3008
}, (info) => {
    console.log(`Server is running on http://localhost:${info.port}`)
})

const roomState = new Map<number, RoomState>()
const io = new Server<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData>(server, {
    cors: { origin: "*" }
})

async function getAllClientsInRoom(roomName: string) {
    const socketsInRoom = await io.in(roomName).fetchSockets();
    const clients: z.infer<typeof authInfoZodType>[] = []

    for (const socket of socketsInRoom) {
        clients.push(socket.data.user)
    }

    return clients
}

async function makeAllClientsLeaveRoom(roomName: string) {
    const socketsInRoom = await io.in(roomName).fetchSockets()

    for (const socket of socketsInRoom) {
        socket.leave(roomName)
    }
}

const str = z.string()
io.use(async (socket, next) => {
    console.log(socket.handshake)
    const token = str.safeParse(socket.handshake.headers.auth)
    if (token.success == false) {
        return next(new Error("Authentication failed"));
    }
    const dataParsed = authInfoZodType.safeParse(JSON.parse(token.data))
    if (dataParsed.success == false) {
        return next(new Error("Authentication failed"));
    }

    socket.data.user = dataParsed.data
    next()
})

io.on("connection", (socket) => {
    console.log("New client connected")

    socket.join(socket.data.user.id);
    const joinRequestsForCreator = joinRequests.filter(item => item.creator == socket.data.user.id)
    for (const item of joinRequestsForCreator) {
        socket.emit("join_request", item.user)
    }

    socket.on("fetch_rooms", async () => {
        const rooms = await db.select().from(schema.roomsTable).where(eq(schema.roomsTable.creator, socket.data.user.id))
        for (const room of rooms) {
            socket.emit("new_room", room)
        }
    })

    socket.on("create_room", async (data) => {
        console.log("socket received")
        const dataParsed = createRoomZodType.safeParse(data)
        if (dataParsed.success == false) {
            socket.emit("error", "Error parsing data")
            return;
        }
        console.log("Data received: ", JSON.stringify(dataParsed))

        const [room] = await db.insert(schema.roomsTable).values({
            name: dataParsed.data.roomName,
            creator: socket.data.user.id,

            creationDate: new Date()
        }).returning()

        socket.emit("new_room", room)
        console.log("emited new room")
    })

    socket.on("delete_room", async (data) => {
        const dataParsed = deleteRoomZodType.safeParse(data)
        if (dataParsed.success == false) {
            socket.emit("error", "Error parsing data")
            return
        }

        const [room] = await db.delete(schema.roomsTable).where(and(eq(schema.roomsTable.id, dataParsed.data.id), eq(schema.roomsTable.creator, dataParsed.data.creatorId))).returning()
        if (room == undefined) {
            socket.emit("error", "You're not the room owner")
            return
        }

        const uploadDir = path.join(process.cwd(), "uploads", dataParsed.data.id.toString())
        await fs.rm(uploadDir, { recursive: true, force: true })

        socket.emit("delete_room", dataParsed.data.id)
        socket.to(dataParsed.data.id.toString()).emit("delete_room", dataParsed.data.id)
        makeAllClientsLeaveRoom(dataParsed.data.id.toString())
    })

    socket.on("join_room", async (data) => {
        const dataParsed = joinRoomZodType.safeParse(data)
        if (dataParsed.success == false) {
            socket.emit("error", "Error parsing data")
            return
        }

        const [room] = await db.select().from(schema.roomsTable).where(eq(schema.roomsTable.id, dataParsed.data.roomId))
        if (room == undefined) {
            socket.emit("error", "Error parsing data")
            return
        }

        if (room.creator !== socket.data.user.id) {
            const [allowedEntry] = await db.select().from(schema.roomMembersTable).where(and(eq(schema.roomMembersTable.roomId, room.id), eq(schema.roomMembersTable.memberId, socket.data.user.id)))
            if (allowedEntry == undefined) {
                const roomRequestsFromThisUser = joinRequests.find(item => {
                    return item.user.id == socket.data.user.id && item.roomId == room.id
                })

                if (roomRequestsFromThisUser !== undefined) {
                    socket.emit("error", "Can't send mulitiple requests to join the same room")
                    return
                }

                joinRequests.push({ creator: room.creator, roomId: room.id, user: socket.data.user })
                socket.to(room.creator).emit("join_request", socket.data.user)
                return
            }
        }
        socket.join(room.id.toString())
        const d = await getAllClientsInRoom(room.id.toString())
        socket.emit("joined_room", room)
        socket.emit("update_clients", d)
        socket.to(room.id.toString()).emit("update_clients", d)
        const state = roomState.get(room.id)
        if (state !== undefined) {
            socket.emit("room_state", state)
        }
    })

    socket.on("disconnect_room", async (data) => {
        const dataParsed = disconnectRoomZodType.safeParse(data)
        if (dataParsed.success == false) {
            socket.emit("error", "Error parsing data")
            return
        }

        socket.leave(dataParsed.data.roomId.toString())
    })

    socket.on("leave_room", async (data) => {
        const dataParsed = leaveRoomZodType.safeParse(data)
        if (dataParsed.success == false) {
            socket.emit("error", "Error parsing data")
            return
        }

        await db.delete(schema.roomMembersTable).where(and(eq(schema.roomMembersTable.roomId, dataParsed.data.roomId), eq(schema.roomMembersTable.memberId, socket.data.user.id)))
    })

    socket.on("allow_join", async (data) => {
        const dataParsed = allowJoinZodtype.safeParse(data)
        if (dataParsed.success == false) {
            socket.emit("error", "Error parsing data")
            return
        }

        const request = joinRequests.find(item => item.roomId == dataParsed.data.roomId && item.user.id == dataParsed.data.userId)
        if (request == undefined) {
            socket.emit("error", "Something went wrong")
            return
        }

        const [room] = await db.select().from(schema.roomsTable).where(eq(schema.roomsTable.id, dataParsed.data.roomId))
        if (room == undefined) {
            socket.emit("error", "Room not found")
            return
        }

        if (room.creator !== socket.data.user.id) {
            socket.emit("error", "You're not the creator of the room")
            return
        }

        await db.insert(schema.roomMembersTable).values({
            roomId: room.id,
            memberId: socket.data.user.id
        })
        socket.emit("allowed_user", { roomId: dataParsed.data.roomId, userId: request.user.id })
        socket.to(request.user.id).emit("new_room", room)
    })

    socket.on("host_action", async (data) => {
        const dataParsed = hostActionZodType.safeParse(data)
        if (dataParsed.success == false) {
            socket.emit("error", "Error parsing data")
            return
        }

        const [room] = await db.select().from(schema.roomsTable).where(eq(schema.roomsTable, dataParsed.data.roomId))
        if (room === undefined) {
            socket.emit("error", "Room does not exist")
            return
        }

        if (room.creator !== socket.data.user.id) {
            socket.emit("error", "You're not the creator of the room")
            return
        }

        const currentRoomState = roomState.get(dataParsed.data.roomId)
        if (currentRoomState == undefined) {
            if (dataParsed.data.action !== "set_song") {
                socket.emit("error", "You can't do actions until you set a song")
                return
            }

            const [metadata] = await db.select().from(schema.uploadedSongsTable).where(eq(schema.uploadedSongsTable.hash, dataParsed.data.songHash))
            if (metadata == undefined) {
                socket.emit("error", "The song hasn't been uploaded yet")
                return
            }

            roomState.set(dataParsed.data.roomId, {
                creator: room.creator,
                songHash: dataParsed.data.songHash,
                songMetadata: {
                    name: metadata.name,
                    artist: metadata.artist
                },
                lastHostAction: dataParsed.data
            })
        } else {
            const [metadata] = await db.select().from(schema.uploadedSongsTable).where(eq(schema.uploadedSongsTable.hash, currentRoomState.songHash))
            if (metadata == undefined) {
                socket.emit("error", "The song hasn't been uploaded yet")
                return
            }

            roomState.set(dataParsed.data.roomId, {
                creator: room.creator,
                songHash: currentRoomState.songHash,
                songMetadata: {
                    name: metadata.name,
                    artist: metadata.artist
                },
                lastHostAction: dataParsed.data
            })
        }
        socket.to(dataParsed.data.roomId.toString()).emit("room_state", roomState.get(dataParsed.data.roomId)!)
    })
})