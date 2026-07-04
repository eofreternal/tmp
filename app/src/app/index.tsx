import { Platform, Text, ScrollView } from "react-native";
import { globalStyles } from "@/styles/global"

export default function IndexScreen() {
  return (
    <ScrollView style={[globalStyles.view, globalStyles.safeAreaPadding]}>
      <Text style={globalStyles.text}>Edit src/app/index.tsx to edit this screen.</Text>
      <Text style={globalStyles.text}>{Platform.OS}</Text>
    </ScrollView>
  );
}
