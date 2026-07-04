import { StyleSheet } from "react-native";

export const colors = {
    background: "#0f0f0f",

    text: "#dfe3e7"
}

export const globalStyles = StyleSheet.create({
    view: {
        flex: 1,
        backgroundColor: colors.background,
        paddingTop: 60,
    },

    text: {
        color: colors.text
    }
}) 