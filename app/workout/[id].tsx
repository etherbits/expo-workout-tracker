import { useLocalSearchParams, usePathname } from "expo-router";
import { Platform, Text, TextInput, View } from "react-native";
import * as SQLite from 'expo-sqlite'
import Colors from "../../constants/Colors";

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

export default function Workout() {
  const pathname = usePathname();
  const { id } = useLocalSearchParams();
  console.log(id)
  return (
    <View>
      <Text style={{ color: Colors.gray[50] }}>{pathname} : workout</Text>
      <TextInput style={{ color: Colors.gray[50] }} onChange={(e) => {
        const text = e.nativeEvent.text
        if (!text || !id) return
        db.transaction((tx) => {
          tx.executeSql(`UPDATE workouts SET label = ? WHERE id = ?;`, [text, +id])
          console.log(text, +id)
        })
      }} />
    </View>
  );
}
