import { create } from "zustand"

const useOtherState = create<{
    search: boolean,

    setSearch: (value: boolean) => void
}>((set, get) => ({
    search: false,

    setSearch: (value) => set((_currentState) => ({ search: value }))
}))

export default useOtherState