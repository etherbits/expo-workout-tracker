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
  getWorkout: (id: number) => Promise<Workout | undefined>;
  addWorkout: (label?: string) => Promise<number | undefined>;
  updateWorkout: (id: number, label: string) => void;
  removeWorkout: (id: number) => void;
}

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
          "SELECT * FROM workouts",
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
  getWorkout: async (id) => {
    return await new Promise((resolve) => {
      db.transaction(
        (tx) => {
          tx.executeSql(
            `SELECT * FROM workouts WHERE id = ? LIMIT 1`,
            [id],
            (_, { rows: { _array: workouts } }) => {
              resolve(workouts[0]);
            }
          );
        },
        (err) => {
          console.log(err);
        }
      );
    });
  },
  addWorkout: async (label = "") => {
    const { fetchWorkouts } = get();

    return await new Promise((resolve) => {
      db.transaction(
        (tx) => {
          tx.executeSql(
            `INSERT into workouts (label) values (?)`,
            [label],
            (_, { insertId }) => {
              resolve(insertId);
            }
          );
        },
        (err) => {
          console.log(err);
        },
        () => {
          fetchWorkouts();
        }
      );
    });
  },
  updateWorkout: (id, label) => {
    const { fetchWorkouts } = get();

    db.transaction((tx) => {
      tx.executeSql(`UPDATE workouts SET label = ? WHERE id = ?;`, [label, id]);
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
