import { Tabs } from "expo-router";
import { Pressable } from "react-native"

import { colors } from "@/styles/global"
import Ionicons from "@react-native-vector-icons/ionicons";
import Entypo from "@react-native-vector-icons/entypo";

export default function RootLayout() {
    return (
        <>
            <Tabs screenOptions={{
                tabBarStyle: {
                    backgroundColor: "#1d1d1d"
                },

                tabBarInactiveTintColor: "#c1c7ce",

                headerStyle: {
                    backgroundColor: colors.background
                },
                headerTintColor: colors.text,
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
            </Tabs>
        </>
    );
}
