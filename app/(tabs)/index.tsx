import {
  Dimensions,
  Platform,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
} from "react-native";
import FontAwesome5 from "@expo/vector-icons/FontAwesome5";

import { Text, View } from "react-native";
import Colors from "../../constants/Colors";
import { useEffect, useState } from "react";
import { Audio } from "expo-av";
import * as SQLite from "expo-sqlite";
import { Link, useRouter } from "expo-router";
import useWorkoutStore from "../../stores/workouts";

function openDatabase() {
  if (Platform.OS === "web") {
    return {
      transaction: () => {
        return {
          executeSql: () => {},
        };
      },
    };
  }

  const db = SQLite.openDatabase("db.db");
  return db;
}

const db = openDatabase();

export default function TabOneScreen() {
  const [workouts, fetchWorkouts, addWorkout, removeWorkout] = useWorkoutStore(
    (store) => [
      store.workouts,
      store.fetchWorkouts,
      store.addWorkout,
      store.removeWorkout,
    ]
  );

  const router = useRouter();

  useEffect(() => {
    fetchWorkouts();
  }, []);

  const add = async () => {
    const { sound } = await Audio.Sound.createAsync(
      require("../../assets/sounds/tap.wav")
    );

    sound.playAsync();

    const id = await addWorkout();
    router.push(`/workout/${id}`);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Workouts</Text>
      <ScrollView style={styles.scrollView}>
        <View style={styles.boxList}>
          {workouts.map((workout) => (
            <Link href={`/workout/${workout.id}`} asChild>
              <Pressable>
                <View key={workout.id} style={styles.box}>
                  <Pressable onPress={() => removeWorkout(workout.id)}>
                    <FontAwesome5
                      size={24}
                      color={Colors.red[500]}
                      name="window-close"
                    />
                  </Pressable>
                  <Text style={styles.boxText}>{workout.label}</Text>
                </View>
              </Pressable>
            </Link>
          ))}
        </View>
      </ScrollView>
      <Pressable onPress={add} style={styles.addButton}>
        <FontAwesome5 size={24} color={Colors.gray[50]} name="plus" />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "relative",
    flex: 1,
    alignItems: "flex-start",
    justifyContent: "flex-start",
    paddingTop: StatusBar.currentHeight || 0 + 16,
    padding: 16,
    overflow: "scroll",
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    color: Colors.black,
    textShadowColor: Colors.gray[50],
    textShadowRadius: 1,
  },
  body: {
    fontSize: 18,
    color: Colors.gray[50],
  },
  scrollView: {
    width: "100%",
  },
  boxList: {
    width: "100%",
    padding: 20,
    gap: 20,
  },
  box: {
    flexGrow: 1,
    height: 160,
    backgroundColor: Colors.gray[900],
    borderRadius: 16,
    flexDirection: "row",
    gap: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  boxText: {
    color: Colors.slate[50],
    fontSize: 20,
  },
  addButton: {
    position: "absolute",
    bottom: 0,
    right: 0,
    marginRight: 32,
    marginBottom: 16,
    backgroundColor: Colors.red[500],
    width: 48,
    height: 48,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 8,
  },
});
