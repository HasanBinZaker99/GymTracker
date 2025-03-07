import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  Alert,
  Modal,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage"; // ✅ Import AsyncStorage
import { useRouter } from "expo-router";
import styles from "./styles";

export default function WorkoutOptions() {
  const router = useRouter();
  const [workoutOptions, setWorkoutOptions] = useState<string[]>([]);
  const [newWorkout, setNewWorkout] = useState<string>("");
  const [modalVisible, setModalVisible] = useState(false);
  const [editIndex, setEditIndex] = useState<number | null>(null);
  const [editedWorkout, setEditedWorkout] = useState("");

  // ✅ Load saved workouts when the screen loads
  useEffect(() => {
    const loadWorkouts = async () => {
      const savedWorkouts = await AsyncStorage.getItem("workoutOptions");
      if (savedWorkouts) {
        setWorkoutOptions(JSON.parse(savedWorkouts));
      } else {
        setWorkoutOptions(["Arm"]); // Default if no saved workouts
      }
    };
    loadWorkouts();
  }, []);

  // ✅ Save workouts to AsyncStorage
  const saveWorkouts = async (options: string[]) => {
    await AsyncStorage.setItem("workoutOptions", JSON.stringify(options));
  };

  // ✅ Add new workout
  const addWorkout = () => {
    if (
      newWorkout.trim() === "" ||
      workoutOptions.includes(newWorkout.trim())
    ) {
      Alert.alert("Error", "Invalid or duplicate workout!");
      return;
    }
    const updatedWorkouts = [...workoutOptions, newWorkout.trim()];
    setWorkoutOptions(updatedWorkouts);
    saveWorkouts(updatedWorkouts); // ✅ Save to storage
    setNewWorkout("");
  };

  // ✅ Open edit modal
  const openEditModal = (index: number) => {
    setEditIndex(index);
    setEditedWorkout(workoutOptions[index]);
    setModalVisible(true);
  };

  // ✅ Save edited workout
  const saveEditedWorkout = () => {
    if (editedWorkout.trim() === "") {
      Alert.alert("Error", "Workout name cannot be empty!");
      return;
    }
    const updatedWorkouts = [...workoutOptions];
    updatedWorkouts[editIndex!] = editedWorkout.trim();
    setWorkoutOptions(updatedWorkouts);
    saveWorkouts(updatedWorkouts); // ✅ Save changes
    setModalVisible(false);
  };

  // ✅ Delete workout
  const deleteWorkout = (index: number) => {
    if (workoutOptions.length === 1) {
      Alert.alert("Error", "You must keep at least one workout!");
      return;
    }
    Alert.alert("Delete Workout", "Are you sure?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: () => {
          const updatedWorkouts = workoutOptions.filter((_, i) => i !== index);
          setWorkoutOptions(updatedWorkouts);
          saveWorkouts(updatedWorkouts); // ✅ Save changes
        },
      },
    ]);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Manage Workout Options</Text>

      {/* Input field to add new workouts */}
      <TextInput
        style={styles.input}
        placeholder="Enter new workout"
        value={newWorkout}
        onChangeText={setNewWorkout}
      />
      <TouchableOpacity style={styles.addButton} onPress={addWorkout}>
        <Text style={styles.buttonText}>+ Add Workout</Text>
      </TouchableOpacity>

      {/* Workout List */}
      <FlatList
        data={workoutOptions}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ item, index }) => (
          <View style={styles.workoutListItem}>
            <Text style={styles.listItemText}>{item}</Text>
            <View style={styles.buttonGroup}>
              <TouchableOpacity
                onPress={() => openEditModal(index)}
                style={styles.editButton}
              >
                <Text style={styles.buttonText}>✏️</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => deleteWorkout(index)}
                style={styles.deleteButton}
              >
                <Text style={styles.buttonText}>🗑️</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      />

      <TouchableOpacity style={styles.button} onPress={() => router.back()}>
        <Text style={styles.buttonText}>Go Back</Text>
      </TouchableOpacity>
    </View>
  );
}
