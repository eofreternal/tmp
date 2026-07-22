import { Text, Pressable, View } from "react-native"
import { useState } from "react";

import { BottomSheet, RNHostView, Host } from '@expo/ui';
import MaterialDesignIcons from '@react-native-vector-icons/material-design-icons';

import { globalStyles } from "@/styles/global";
import AddToPlaylist from "./addToPlaylist";


export default function songThreeDotMenu({ show, songId, onClose }: { show: boolean, songId: number, onClose: () => void }) {
    const [showPlaylists, setShowPlaylists] = useState(false)

    return (
        <>
            <Host>
                <BottomSheet isPresented={show} onDismiss={() => onClose()}>
                    <RNHostView matchContents>
                        <View style={{
                            display: "flex",
                            flexDirection: "column",

                            gap: 12
                        }}>
                            <Pressable onPress={() => setShowPlaylists(true)} style={{
                                display: "flex",
                                flexDirection: "row",

                                gap: 8
                            }}>
                                <MaterialDesignIcons name="playlist-plus" size={24} color="white" />
                                <Text style={globalStyles.text}>Add to a playlist</Text>
                            </Pressable>
                        </View>
                    </RNHostView>
                </BottomSheet>
            </Host>

            <AddToPlaylist show={showPlaylists} songId={songId} onClose={() => setShowPlaylists(false)} />
        </>
    )
}