import { useLocalSearchParams, usePathname } from "expo-router";
import { Platform, Text, TextInput, View } from "react-native";
import * as SQLite from "expo-sqlite";
import Colors from "../../constants/Colors";
import useWorkoutStore from "../../stores/workouts";

export default function Workout() {
  const pathname = usePathname();
  const { id } = useLocalSearchParams();

  const updateWorkout = useWorkoutStore((state) => state.updateWorkout)

  return (
    <View>
      <Text style={{ color: Colors.gray[50] }}>{pathname} : workout</Text>
      <TextInput
        style={{ color: Colors.gray[50] }}
        onChange={(e) => {
          const text = e.nativeEvent.text;
          if (!id || !text) return;
          updateWorkout(+id, text)
        }}
      />
    </View>
  );
}
