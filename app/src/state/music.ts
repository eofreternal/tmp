import { AudioPlayer, createAudioPlayer } from "expo-audio";
import { create } from "zustand";

const useMusicStore = create<{
    player: AudioPlayer,

    setPlayer: (newPlayer: AudioPlayer) => void
}>((set) => ({
    player: createAudioPlayer(null),

    setPlayer: (newPlayer) => set((_currentState) => ({ player: newPlayer })),
}));

export default useMusicStore;
