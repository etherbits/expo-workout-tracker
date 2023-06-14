import { create } from "zustand";
import { Platform } from "react-native";
import * as SQLite from "expo-sqlite";

export type Workout = {
  id: number;
  label: string;
};

export type Exercise = {
  id: number;
  name: string;
  reps: number;
  placement: number;
  sets?: number;
  duration?: number;
};

interface WorkoutStore {
  workouts: Workout[];
  fetchWorkouts: () => void;
  getWorkout: (id: number) => Promise<Workout | undefined>;
  addWorkout: (label?: string) => Promise<number | undefined>;
  updateWorkout: (id: number, label: string) => void;
  removeWorkout: (id: number) => void;
  fetchExercises: (workoutId: number) => Promise<Exercise[]>;
  addExercise: (workoutId: number, exercise: Omit<Exercise, "id">) => void;
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
    tx.executeSql(
      `create TABLE if not EXISTS exercises (id INTEGER PRIMARY KEY NOT null,
        name TEXT, duration INTEGER, sets INTEGER, reps INTEGER, placement INTEGER);`
    );
    tx.executeSql(
      `create TABLE if not EXISTS workout_exercises (id INTEGER PRIMARY KEY NOT NULL,
        workout_id INTEGER, exercise_id INTEGER, FOREIGN KEY (workout_id) References workouts(id), 
        FOREIGN KEY (exercise_id) REFERENCES exercises(id));`
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
  fetchExercises: async (workoutId) => {
    return await new Promise((resolve) => {
      db.transaction((tx) => {
        tx.executeSql(
          `SELECT * FROM workout_exercises
            INNER JOIN exercises ON exercises.id = workout_exercises.exercise_id 
            WHERE workout_id = ?`,
          [workoutId],
          (_, { rows: { _array: workoutExercises } }) => {
            resolve(workoutExercises);
          }
        );
      });
    });
  },
  addExercise: (workoutId, exercise) => {
    db.transaction((tx) => {
      tx.executeSql(
        `INSERT INTO exercises (name, reps, placement, sets, duration) VALUES (?, ?, ?, ?, ?)`,
        [
          exercise.name,
          exercise.reps,
          exercise.placement,
          exercise.sets || null,
          exercise.duration || null,
        ],
        (_, { insertId }) => {
          if (!insertId) return;

          tx.executeSql(
            "INSERT INTO workout_exercises (workout_id, exercise_id) VALUES (?, ?)",
            [workoutId, insertId]
          );
        }
      );
    });
  },
}));

export default useWorkoutStore;
