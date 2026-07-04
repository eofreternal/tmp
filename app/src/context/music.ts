import { createContext } from "react";

export const MusicContext = createContext<{
    songs: any[],
    playlists: any[]
}>({
    songs: [],
    playlists: []
})