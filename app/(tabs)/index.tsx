import { Pressable, ScrollView, StatusBar, StyleSheet } from "react-native";
import FontAwesome5 from "@expo/vector-icons/FontAwesome5";

import { Text, View } from "react-native";
import Colors from "../../constants/Colors";
import { useState } from "react";
import { Audio } from "expo-av";

export default function TabOneScreen() {
  const [workouts, setWorkouts] = useState<string[]>([]);
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Workouts</Text>
      <ScrollView style={styles.scrollView}>
        <View style={styles.boxList}>
          {workouts.map((workout, i) => (
            <View key={i} style={styles.box}>
              <Text style={styles.boxText}>{workout}</Text>
            </View>
          ))}
        </View>
      </ScrollView>
      <Pressable
        onPress={async () => {
          const { sound } = await Audio.Sound.createAsync(
            require("../../assets/sounds/tap.wav")
          );
          sound.playAsync();
          setWorkouts([...workouts, "workout #" + workouts.length]);
        }}
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
