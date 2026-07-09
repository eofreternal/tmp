import { StyleSheet } from "react-native";
export const colors = {
    background: "#0f0f0f",

    text: "#dfe3e7",
    secondaryText: "#585858"
}

export const globalStyles = StyleSheet.create({
    view: {
        flex: 1,
        backgroundColor: colors.background
    },
    text: {
        color: colors.text
    },
    secondaryText: {
        color: colors.secondaryText
    }
}) 