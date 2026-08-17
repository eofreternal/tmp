import { useEffect, useState } from "react";

import AsyncStorage from "@react-native-async-storage/async-storage"

import { getOrSetDeviceId, NAME, setName as setNameUtilFunction } from "@/util"
import { SafeAreaView } from "react-native-safe-area-context";
import { BottomSheet, Column, useNativeState, TextInput, Button, Text as UIText } from "@expo/ui";
import { colors, globalStyles } from "@/styles/global";
import { FlashList } from "@shopify/flash-list";
import { Pressable, Text } from "react-native";
import { useListenStore } from "@/state/listen";

export default function Listen() {
    const listenStore = useListenStore((state) => state)

    const [name, setName] = useState<string | null>(null)
    const newName = useNativeState("")
    const roomName = useNativeState("")
    const [showSetName, setShowSetName] = useState(false)
    const [showCreateRoom, setShowCreateRoom] = useState(false)

    useEffect(() => {
        async function temp() {
            const d = await AsyncStorage.getItem(NAME)
            if (d == null) {
                setShowSetName(true)
            } else {
                setName(d)
            }
        }
        temp()
    }, [])

    useEffect(() => {
        if (name !== null) {
            listenStore.init(name)
        }
    }, [name])

    async function setNameFunction() {
        setName(await setNameUtilFunction(newName.value))
        newName.value = ""
        setShowSetName(false)
    }

    async function createRoomFunction() {
        console.log("Function enter")
        if (listenStore.socket == null) {
            console.log("Socket null wha?")
            return
        }

        setShowCreateRoom(false)
        listenStore.socket.emit("create_room", {
            creatorId: await getOrSetDeviceId(),
            roomName: roomName.value
        })
        roomName.value = ""
        console.log("Socket sent")
    }

    function joinRoom(roomId: number) {
        if (listenStore.socket == null) {
            return
        }
        console.log("Join room:", roomId)
        listenStore.socket.emit("join_room", { roomId: roomId })
    }

    return (
        <SafeAreaView style={[globalStyles.view]}>
            <FlashList
                data={listenStore.rooms}

                renderItem={(({ item }) => (
                    <Pressable style={{
                        display: "flex",
                        flexDirection: "row",

                        borderWidth: 1,
                        borderColor: "green"
                    }} onPress={() => joinRoom(item.id)}>
                        <Text style={{
                            color: colors.light
                        }}>{item.name}</Text>
                    </Pressable>
                ))}
                contentContainerStyle={{
                    padding: 10
                }}
            />

            <Pressable onPress={() => setShowCreateRoom(true)}>
                <Text style={[globalStyles.accentText, {
                    alignSelf: "center"
                }]}>Create a Room</Text>
            </Pressable>

            <BottomSheet isPresented={showCreateRoom} onDismiss={() => setShowCreateRoom(false)}>
                <Column spacing={16} style={{
                    paddingBottom: 16
                }}>
                    <TextInput
                        placeholder="My awesome room"
                        value={roomName}

                        autoFocus={true}
                        style={{
                            padding: 8,
                            backgroundColor: colors.background,

                            borderColor: colors.accent,
                            borderWidth: 1,
                            borderRadius: 8
                        }}

                        placeholderTextColor={colors.mutedLight}
                    />

                    <Button onPress={() => createRoomFunction()} label="Create room" />
                </Column>
            </BottomSheet>

            <BottomSheet isPresented={showSetName} onDismiss={() => setShowSetName(false)}>
                <Column spacing={16} style={{
                    paddingBottom: 16
                }}>
                    <UIText>Set a name</UIText>
                    <TextInput
                        placeholder="John Doe"
                        value={newName}

                        autoFocus={true}
                        style={{
                            padding: 8,
                            backgroundColor: colors.background,

                            borderColor: colors.accent,
                            borderWidth: 1,
                            borderRadius: 8
                        }}
                        placeholderTextColor={colors.mutedLight}
                    />

                    <Button onPress={() => setNameFunction()} label="Set name" />
                </Column>
            </BottomSheet>
        </SafeAreaView>
    )
}