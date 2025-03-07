import { View, Text, Button, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import styles from "./styles";
export default function Home() {
  const router = useRouter();

  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <Text style={{ fontSize: 24 }}>Hi, Welcome! 🎉</Text>
      <TouchableOpacity
        style={styles.button}
        onPress={() => router.push("/create-workout")}
      >
        <Text> Create Workout</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.button}
        onPress={() => router.push("/workout-options")}
      >
        <Text>Workout Options</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.button}
        onPress={() => router.push("/show-workout")}
      >
        <Text>View Data</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.button}
        onPress={() => router.push("/recent-workout")}
      >
        <Text>Recent Workouts</Text>
      </TouchableOpacity>
      <Button title="Logout" onPress={() => router.push("/")} />
    </View>
  );
}
