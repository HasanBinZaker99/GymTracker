import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import DateTimePickerModal from "react-native-modal-datetime-picker";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import moment from "moment";
import axios from "axios";

const API_URL = "https://gymtracker1.onrender.com"; // Replace with actual API URL

export default function CreateWorkout() {
  const router = useRouter();
  const [selectedWorkouts, setSelectedWorkouts] = useState<string[]>([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [workoutOptions, setWorkoutOptions] = useState<string[]>([]);
  const [tickStatuses, setTickStatuses] = useState<{ [key: string]: string }>(
    {}
  );
  const [userEmail, setUserEmail] = useState("");

  useEffect(() => {
    const loadUserData = async () => {
      try {
        const email = await AsyncStorage.getItem("userEmail");
        if (email) {
          setUserEmail(email);
        }

        const savedWorkouts = await AsyncStorage.getItem("workoutOptions");
        if (savedWorkouts) {
          setWorkoutOptions(JSON.parse(savedWorkouts));
        } else {
          setWorkoutOptions(["Arm", "Legs", "Biceps", "Tri"]);
        }
      } catch (error) {
        console.error("Error retrieving data:", error);
      }
    };

    loadUserData();
  }, []);

  const handleTickSelection = (workout: string) => {
    setTickStatuses((prev) => {
      const isSelected = prev[workout] === "✔️";
      const updatedStatuses = { ...prev, [workout]: isSelected ? "❌" : "✔️" };

      setSelectedWorkouts((prevWorkouts) =>
        isSelected
          ? prevWorkouts.filter((w) => w !== workout)
          : [...prevWorkouts, workout]
      );

      return updatedStatuses;
    });
  };
  const handleSave = async () => {
    if (!userEmail) {
      alert("Please log in to save workouts.");
      return;
    }

    const formattedDate = moment(selectedDate).format("YYYY-MM-DD");
    const formattedTime = moment(selectedDate).format("HH:mm");

    // Convert workouts to an object format (key-value structure)
    const formattedWorkouts = workoutOptions.reduce((acc, workout) => {
      acc[workout] = tickStatuses[workout] || "❌"; // Default to ❌ if not interacted with
      return acc;
    }, {} as Record<string, string>);

    console.log("Formatted Workouts:", formattedWorkouts);

    const workoutData = {
      email: userEmail,
      workouts: formattedWorkouts, // ✅ Now an object instead of an array
      date: formattedDate,
      time: formattedTime,
    };

    console.log("Workout Data Sending:", workoutData);

    try {
      const response = await axios.post<{ message: string }>(
        `${API_URL}/save-workout`,
        workoutData
      );

      if (
        response.status === 200 &&
        response.data.message === "You already checked this workout!"
      ) {
        alert("You already checked this workout for today!");
      } else {
        alert("Workouts saved successfully!");
        router.push("/home");
      }
    } catch (error) {
      console.error("Network Error:", error);
      alert("Failed to save workouts. Please try again.");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Select a Workout</Text>

      {workoutOptions.map((option, index) => (
        <View key={index} style={styles.row}>
          <TouchableOpacity
            style={[
              styles.optionButton,
              selectedWorkouts.includes(option) && styles.selectedButton,
            ]}
            onPress={() => handleTickSelection(option)}
          >
            <Text style={styles.buttonText}>{option}</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => handleTickSelection(option)}>
            <Text style={styles.tick}>{tickStatuses[option] || "❌"}</Text>
          </TouchableOpacity>
        </View>
      ))}

      <DateTimePickerModal
        isVisible={showDatePicker}
        mode="date"
        onConfirm={(date) => {
          setSelectedDate(date);
          setShowDatePicker(false);
        }}
        onCancel={() => setShowDatePicker(false)}
      />

      <DateTimePickerModal
        isVisible={showTimePicker}
        mode="time"
        onConfirm={(time) => {
          setSelectedDate(time);
          setShowTimePicker(false);
        }}
        onCancel={() => setShowTimePicker(false)}
      />

      <View style={styles.dateTimeContainer}>
        <TouchableOpacity
          onPress={() => setShowDatePicker(true)}
          style={styles.dateTimeButton}
        >
          <Text style={styles.buttonText}>
            {moment(selectedDate).format("MMM DD, YYYY")}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setShowTimePicker(true)}
          style={styles.dateTimeButton}
        >
          <Text style={styles.buttonText}>
            {moment(selectedDate).format("hh:mm A")}
          </Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
        <Text style={styles.buttonText}>Save</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  header: { fontSize: 22, fontWeight: "bold", marginBottom: 20 },
  row: {
    flexDirection: "row",
    alignItems: "center",
    width: "90%",
    justifyContent: "space-between",
    marginVertical: 10,
  },
  optionButton: {
    width: "70%",
    padding: 15,
    backgroundColor: "#007BFF",
    borderRadius: 8,
    alignItems: "center",
  },
  selectedButton: { backgroundColor: "#0056b3" },
  buttonText: { color: "white", fontSize: 18 },
  tick: { fontSize: 24, paddingHorizontal: 10 },
  dateTimeContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "90%",
    marginVertical: 10,
  },
  dateTimeButton: {
    width: "45%",
    height: 40,
    backgroundColor: "#007BFF",
    borderRadius: 5,
    justifyContent: "center",
    alignItems: "center",
  },
  saveButton: {
    width: "90%",
    padding: 15,
    backgroundColor: "#28a745",
    borderRadius: 8,
    alignItems: "center",
    marginTop: 15,
  },
});
