import { Platform, Text, ScrollView } from "react-native";
import { Link } from 'expo-router';
import { globalStyles } from "@/styles/global"
import { SafeAreaView } from "react-native-safe-area-context";

export default function IndexScreen() {
  return (
    <SafeAreaView style={[globalStyles.view]}>
      <ScrollView>
        <Text style={globalStyles.text}>Edit src/app/index.tsx to edit this screen.</Text>
        <Text style={globalStyles.text}>{Platform.OS}</Text>
        <Text style={globalStyles.text}>Settings?</Text>
        <Link style={globalStyles.text} href="/settings"><Text style={globalStyles.text}>Go to settingssssss</Text></Link>
      </ScrollView>
    </SafeAreaView>
  );
}
