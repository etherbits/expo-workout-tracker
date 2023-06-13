import { create } from "zustand";
import { Platform } from "react-native";
import * as SQLite from "expo-sqlite";

type Workout = {
  id: number;
  label: string;
};

interface WorkoutStore {
  workouts: Workout[];
  fetchWorkouts: () => void;
  addWorkout: (label?: string) => number | undefined;
  updateWorkout: (id: number, label: string) => void;
  removeWorkout: (id: number) => void;
}

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

db.transaction(
  (tx) => {
    tx.executeSql(
      "create TABLE if not EXISTS workouts (id integer primary key not null, label text);"
    );
  },
  (err) => {
    console.log("Failed to create workout table", err);
  },
  () => {
    console.log("Created/Got workout table");
  }
);

const useWorkoutStore = create<WorkoutStore>()((set, get) => ({
  workouts: [],
  fetchWorkouts: () => {
    db.transaction(
      (tx) => {
        tx.executeSql(
          "Select * from workouts",
          [],
          (_, { rows: { _array: workouts } }) => {
            set({ workouts });
          }
        );
      },
      (err) => {
        console.log("Workout fetch query error: ", err);
      },
      () => {
        console.log("Workout fetch query success!");
      }
    );
  },
  addWorkout: (label = "") => {
    let id: number | undefined = undefined;

    const { fetchWorkouts } = get();

    db.transaction(
      (tx) => {
        tx.executeSql(
          `INSERT into workouts (label) values (?)`,
          [label],
          (_, { insertId }) => {
            id = insertId;
            console.log("set ", id);
          }
        );
      },
      (err) => {
        console.log(err);
      }
    );

    fetchWorkouts();

    return id;
  },
  updateWorkout: (id, label) => {
    const { fetchWorkouts } = get();

    db.transaction((tx) => {
      tx.executeSql(`UPDATE workouts SET label = ? WHERE id = ?;`, [
        label,
        id,
      ]);
    });

    fetchWorkouts();
  },
  removeWorkout: (id) => {
    const { fetchWorkouts } = get();
    db.transaction((tx) => {
      tx.executeSql("DELETE FROM workouts WHERE id = ?", [id]);
    });
    fetchWorkouts();
  },
}));

export default useWorkoutStore;
