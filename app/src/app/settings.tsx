import { globalStyles } from "@/styles/global"
import { View, Text } from "react-native"

export default function Page() {
    return (
        <View style={[globalStyles.view]}>
            <Text style={[globalStyles.text]}>Heyooo! Welcome to settings! :D</Text>
        </View>
    )
}