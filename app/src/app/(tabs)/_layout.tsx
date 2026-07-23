import { Tabs } from "expo-router";
import { Pressable, View } from "react-native"
import { BottomTabBar } from "expo-router/js-tabs";

import { colors } from "@/styles/global"
import Ionicons from "@react-native-vector-icons/ionicons";
import Entypo from "@react-native-vector-icons/entypo";
import MaterialDesignIcons from '@react-native-vector-icons/material-design-icons';
import Preview from "@/components/preview";

export default function RootLayout() {
    return (
        <>
            <Tabs
                tabBar={(props) => (
                    <View>
                        <Preview />
                        <BottomTabBar {...props} />
                    </View>
                )}

                screenOptions={{
                    tabBarStyle: {
                        backgroundColor: colors.secondary
                    },
                    tabBarInactiveTintColor: "#c1c7ce",

                    headerStyle: {
                        backgroundColor: colors.background
                    },
                    headerTintColor: colors.light,
                    headerTitleAlign: "center",

                    headerLeft: () => (<Pressable style={{ paddingLeft: 8 }}><Ionicons name="search" size={24} color="white" /></Pressable>),

                }}>
                <Tabs.Screen name="index" options={{
                    title: "Home",
                    tabBarIcon: ({ color, size }) => (<Entypo name="home" size={size} color={color} />)
                }} />
                <Tabs.Screen name="songs" options={{
                    title: "Songs",
                    tabBarIcon: ({ color, size }) => (<Ionicons name="musical-note" size={size} color={color} />)
                }} />
                <Tabs.Screen name="playlists" options={{
                    title: "Playlists",
                    tabBarIcon: ({ color, size }) => (<MaterialDesignIcons name="playlist-music" size={size} color={color} />)
                }} />
            </Tabs >
        </>
    );
}
