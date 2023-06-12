import {
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
import { Link } from "expo-router";

function openDatabase() {
  if (Platform.OS === "web") {
    return {
      transaction: () => {
        return {
          executeSql: () => { },
        };
      },
    };
  }

  const db = SQLite.openDatabase("db.db");
  return db;
}

const db = openDatabase();

type workout = {
  id: number;
  label: string;
};

export default function TabOneScreen() {
  const [workouts, setWorkouts] = useState<workout[]>([]);

  useEffect(() => {
    console.log("running...");

    db.transaction(
      (tx) => {
        tx.executeSql(
          "create TABLE if not EXISTS workouts (id integer primary key not null, label text);"
        );
        tx.executeSql(
          "Select * from workouts",
          [],
          (_, { rows: { _array: workouts } }) => {
            setWorkouts(workouts);
          }
        );
      },
      (err) => {
        console.log(err);
      },
      () => {
        console.log("success");
      }
    );
  }, []);

  const removeWorkout = (workoutId: number) => {
    db.transaction((tx) => {
      tx.executeSql('DELETE FROM workouts WHERE id = ?', [workoutId])
      tx.executeSql(
        "Select * from workouts",
        [],
        (_, { rows: { _array: workouts } }) => {
          setWorkouts(workouts);
        }
      );
    })
  }

  const addWorkout = async () => {
    const { sound } = await Audio.Sound.createAsync(
      require("../../assets/sounds/tap.wav")
    );
    sound.playAsync();
    console.log("click");

    db.transaction(
      (tx) => {
        tx.executeSql(`INSERT into workouts (label) values ("workout ${workouts.length + 1}")`);
        tx.executeSql(
          "Select * from workouts",
          [],
          (_, { rows: { _array: workouts } }) => {
            setWorkouts(workouts);
          }
        );
      },
      (err) => {
        console.log(err);
      }
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Workouts</Text>
      <ScrollView style={styles.scrollView}>
        <View style={styles.boxList}>
          {workouts.map((workout) => (

            <Link href={`/workout/${workout.id}`} key={workout.id} style={styles.box}>
              <Text style={styles.boxText}>{workout.label}</Text>
              <Pressable onPress={() => removeWorkout(workout.id)}>
                <FontAwesome5 size={24} color={Colors.red[500]} name="window-close" />
              </Pressable>
            </Link>

          ))}
        </View>
      </ScrollView>
      <Pressable
        onPress={addWorkout}
        style={styles.addButton}
      >
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
    width: "100%",
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
