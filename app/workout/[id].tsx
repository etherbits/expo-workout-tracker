import { usePathname } from "expo-router";
import { Text, View } from "react-native";
import Colors from "../../constants/Colors";

export default function Workout() {
  const pathname = usePathname();
  console.log(pathname)
  return (
    <View>
      <Text style={{ color: Colors.gray[50] }}>workout page</Text>
      <Text style={{ color: Colors.gray[50] }}>{pathname} : workout</Text>
    </View>
  );
}
