import { Tabs } from "expo-router";
import { colors } from "@/styles/global"
import Ionicons from '@expo/vector-icons/Ionicons';
import Entypo from '@expo/vector-icons/Entypo';

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
        headerTintColor: colors.text
      }}>
        <Tabs.Screen name="index" options={{
          title: "Home",
          tabBarIcon: ({ color, size }) => (<Ionicons name="musical-note" size={size} color={color} />)
        }} />
        <Tabs.Screen name="songs" options={{
          title: "Songs",
          tabBarIcon: ({ color, size }) => (<Entypo name="home" size={size} color={color} />)
        }} />
      </Tabs>
    </>
  );
}
