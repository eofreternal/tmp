import { StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context"

const insets = useSafeAreaInsets()

export const colors = {
    background: "#0f0f0f",

    text: "#dfe3e7"
}

export const globalStyles = StyleSheet.create({
    view: {
        flex: 1,
        backgroundColor: colors.background
    },
    safeAreaPadding: {
        paddingTop: insets.top,
        paddingLeft: insets.left,
        paddingRight: insets.right,
        paddingBottom: insets.bottom
    },

    text: {
        color: colors.text
    }
}) 