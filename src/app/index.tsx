import { Platform, Text, ScrollView } from "react-native";
import { globalStyles } from "@/styles/global"

export default function Index() {
  return (
    <ScrollView style={globalStyles.view}>
      <Text>Edit src/app/index.tsx to edit this screen.</Text>
      <Text>{Platform.OS}</Text>
    </ScrollView>
  );
}
