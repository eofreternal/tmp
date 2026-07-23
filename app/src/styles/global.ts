import { StyleSheet } from "react-native";
import { Color } from 'expo-router';

// Old colors
// export const colors = {
//     background: "#0f0f0f",
//     accent: "#81cfff",

//     text: "#dfe3e7",
//     secondaryText: "#585858"
// }

// Colors stolen from Symphony
export const colors = {
    background: "hsl(210, 21%, 7%)",
    secondary: "hsl(206, 13%, 11%)",
    tertiary: "hsl(206, 11%, 12%)",

    accent: "#81cfff",

    light: "#DAE2F9",
    mutedLight: "#dae2f9b3"
}

export const globalStyles = StyleSheet.create({
    view: {
        flex: 1,
        backgroundColor: colors.background
    },
    text: {
        color: colors.light
    },
    mutedText: {
        color: colors.mutedLight
    },
    accentText: {
        color: colors.accent
    }
}) 