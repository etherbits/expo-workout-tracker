import { useLocalSearchParams, usePathname } from "expo-router";
import { Platform, Pressable, Text, TextInput, View } from "react-native";
import * as SQLite from "expo-sqlite";
import Colors from "../../constants/Colors";
import useWorkoutStore from "../../stores/workouts";
import { useEffect, useState } from "react";

export default function Workout() {
  const pathname = usePathname();
  const { id } = useLocalSearchParams();

  const [getWorkout, updateWorkout, addExercise] = useWorkoutStore((state) => [
    state.getWorkout,
    state.updateWorkout,
    state.addExercise,
  ]);

  const [label, setLabel] = useState("");

  useEffect(() => {
    if (!id) return;
    const setDataFromDB = async () => {
      const workout = await getWorkout(+id);
      setLabel(workout?.label || "");
    };

    setDataFromDB();
  }, []);

  useEffect(() => {
    if (!id) return;
    updateWorkout(+id, label);
  }, [label]);

  return (
    <View>
      <Text style={{ color: Colors.gray[50] }}>{pathname} : workout</Text>
      <TextInput
        style={{ color: Colors.gray[50] }}
        value={label}
        onChange={(e) => {
          setLabel(e.nativeEvent.text);
        }}
      />
      <Pressable
        onPress={() => {
          if (!id) return;
          addExercise(+id, {
            name: "push ups",
            placement: 0,
            sets: 2,
            reps: 12,
          });
        }}
      >
        <Text>add</Text>
      </Pressable>
    </View>
  );
}
