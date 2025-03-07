import React, { useEffect, useState } from "react";
import { View, Text, FlatList, ActivityIndicator } from "react-native";
import { useLocalSearchParams } from "expo-router";

export default function RecentWorkouts() {
  const { email } = useLocalSearchParams();
  const [workouts, setWorkouts] = useState<WorkoutEntry[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  interface WorkoutEntry {
    date: string;
    workouts: Record<string, string>;
  }

  useEffect(() => {
    const fetchRecentWorkouts = async () => {
      try {
        const currentDate = new Date().toISOString().split("T")[0]; // Get today's date
        const response = await fetch(
          `https://gymtracker1.onrender.com/recent-workout?email=${email}&date=${currentDate}`
        );
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Failed to fetch workouts");
        }

        setWorkouts(data);
      } catch (err) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError("An unknown error occurred");
        }
      } finally {
        setLoading(false);
      }
    };

    if (email) {
      fetchRecentWorkouts();
    }
  }, [email]);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Text style={{ color: "red" }}>Error: {error}</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, padding: 20 }}>
      <Text style={{ fontSize: 20, fontWeight: "bold", textAlign: "center" }}>
        Recent Workouts
      </Text>
      {workouts.length === 0 ? (
        <Text style={{ textAlign: "center", marginTop: 20 }}>
          No recent workouts found.
        </Text>
      ) : (
        <FlatList
          data={workouts}
          keyExtractor={(item, index) => index.toString()}
          renderItem={({ item }) => (
            <View
              style={{
                marginVertical: 10,
                padding: 10,
                backgroundColor: "#f0f0f0",
                borderRadius: 8,
              }}
            >
              <Text style={{ fontWeight: "bold" }}>Date: {item.date}</Text>
              {Object.entries(item.workouts).map(([exercise, status]) => (
                <Text key={exercise}>
                  {exercise}: {status === "✔" ? "Completed" : "Missed"}
                </Text>
              ))}
            </View>
          )}
        />
      )}
    </View>
  );
}
