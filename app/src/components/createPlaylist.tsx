import { useState } from 'react';

import { View, Text } from 'react-native';
import { BottomSheet, RNHostView, Host, TextInput, useNativeState, Column } from '@expo/ui';
import { db } from "@/db/index"
import * as schema from "@/db/schema"
import { colors } from '@/styles/global';

export default function CreatePlaylistComponent({ show, onClose }: { show: boolean, onClose: () => void }) {
    const playlistName = useNativeState("")

    async function createPlaylist() {
        await db.insert(schema.playlistTable).values({
            name: playlistName.value
        })

        doTheClosingThing()
    }

    async function doTheClosingThing() {
        playlistName.value = ""
        onClose()
    }

    return (
        <Host>
            <BottomSheet isPresented={show} onDismiss={() => { doTheClosingThing() }}>
                <Column spacing={16} style={{
                    paddingBottom: 16
                }}>
                    <TextInput
                        placeholder="My awesome playlist"
                        value={playlistName}

                        autoFocus={true}
                        style={{
                            padding: 8,
                            backgroundColor: colors.background,

                            borderColor: colors.accent,
                            borderWidth: 1,
                            borderRadius: 8
                        }}
                    />

                    <RNHostView matchContents>
                        <View style={{
                            display: "flex",
                            flexDirection: "column",

                            gap: 24,
                            justifyContent: "flex-end"
                        }}>
                            <Text style={{ color: colors.accent }} onPress={() => createPlaylist()}>Create</Text>
                        </View>
                    </RNHostView></Column>
            </BottomSheet>
        </Host>
    )
}