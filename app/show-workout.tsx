import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import DateTimePickerModal from "react-native-modal-datetime-picker";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import moment from "moment";
import { useRouter } from "expo-router"; // Navigation fix for Expo Router

const API_URL = "https://gymtracker-2.onrender.com"; // Replace with your actual API URL

interface Workout {
  workout: string;
  tickStatus: string;
}

export default function ShowWorkout() {
  const router = useRouter();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [loading, setLoading] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [dataFetched, setDataFetched] = useState(false);

  useEffect(() => {
    const fetchUserEmail = async () => {
      const email = await AsyncStorage.getItem("userEmail");
      if (email) {
        setUserEmail(email);
      } else {
        alert("⚠️ No user email found. Please log in again.");
      }
    };
    fetchUserEmail();
  }, []);

  const fetchWorkouts = async () => {
    if (!userEmail) {
      alert("⚠️ User email is missing. Please log in again.");
      return;
    }

    const formattedDate = moment(selectedDate).format("YYYY-MM-DD");
    setLoading(true);
    try {
      console.log("📤 Fetching workouts for:", userEmail, formattedDate);

      const response = await axios.get<
        { workouts: { [key: string]: string } }[]
      >(`${API_URL}/get-workout`, {
        params: { email: userEmail, date: formattedDate },
      });

      console.log("✅ API Response:", response.data);

      if (response.data.length > 0) {
        const workoutArray = response.data.flatMap((entry) =>
          Object.entries(entry.workouts).map(([workout, tickStatus]) => ({
            workout,
            tickStatus,
          }))
        );

        setWorkouts(workoutArray);
        setDataFetched(true);
      } else {
        setWorkouts([]);
        setDataFetched(false);
      }
    } catch (error: any) {
      console.error("❌ AxiosError:", error.response?.data || error.message);
      alert(
        `❌ Error fetching data: ${
          error.response?.data?.message || error.message
        }`
      );
      setWorkouts([]);
      setDataFetched(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Workout History</Text>

      {!dataFetched ? (
        <>
          <View style={styles.dateRow}>
            <TouchableOpacity
              onPress={() => setDatePickerVisibility(true)}
              style={styles.buttonSmall}
            >
              <Text style={styles.buttonText}>Select Date</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setDatePickerVisibility(true)} // Make date clickable
              style={styles.dateContainer}
            >
              <Text style={styles.selectedDateText}>
                {moment(selectedDate).format("YYYY-MM-DD")}
              </Text>
            </TouchableOpacity>
          </View>

          <DateTimePickerModal
            isVisible={isDatePickerVisible}
            mode="date"
            onConfirm={(date) => {
              setDatePickerVisibility(false);
              setSelectedDate(date);
            }}
            onCancel={() => setDatePickerVisibility(false)}
          />

          <TouchableOpacity onPress={fetchWorkouts} style={styles.button}>
            <Text style={styles.buttonText}>Show</Text>
          </TouchableOpacity>
        </>
      ) : (
        <>
          <Text style={styles.dateHeader}>
            Workouts for {moment(selectedDate).format("YYYY-MM-DD")}
          </Text>

          {loading ? (
            <ActivityIndicator size="large" color="#007bff" />
          ) : workouts.length === 0 ? (
            <Text style={styles.emptyText}>No workouts found.</Text>
          ) : (
            <FlatList
              data={workouts}
              keyExtractor={(item, index) => index.toString()}
              renderItem={({ item }) => (
                <View style={styles.listItem}>
                  <Text style={styles.listText}>{item.workout}</Text>
                  <Text style={styles.listText}>{item.tickStatus}</Text>
                </View>
              )}
            />
          )}

          {/* Back Button Positioned Below Workouts */}
          <TouchableOpacity
            onPress={() => {
              setDataFetched(false);
              setWorkouts([]);
            }}
            style={styles.backButton}
          >
            <Text style={styles.backText}>← Back</Text>
          </TouchableOpacity>
        </>
      )}
    </View>
  );
}

// Updated Styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    backgroundColor: "#f8f9fa",
  },
  header: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 20,
  },
  dateRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: "80%",
    marginBottom: 10,
  },
  dateContainer: {
    paddingVertical: 12,
    paddingHorizontal: 15,
    backgroundColor: "#e0e0e0",
    borderRadius: 8,
  },
  selectedDateText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#555",
  },
  buttonSmall: {
    backgroundColor: "#007BFF",
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderRadius: 8,
  },
  button: {
    backgroundColor: "#007BFF",
    padding: 15,
    borderRadius: 8,
    marginVertical: 10,
    width: "80%",
    alignItems: "center",
  },
  buttonText: {
    color: "white",
    fontSize: 18,
  },
  emptyText: {
    fontSize: 16,
    color: "gray",
    marginTop: 20,
  },
  listItem: {
    padding: 15,
    backgroundColor: "#e3e3e3",
    borderRadius: 8,
    marginVertical: 5,
    width: "90%",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 15,
  },
  listText: {
    fontSize: 18,
  },
  dateHeader: {
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 10,
    marginBottom: 10,
  },
  backButton: {
    marginTop: 20,
    backgroundColor: "#FF5733",
    padding: 12,
    borderRadius: 8,
    width: "60%",
    alignItems: "center",
  },
  backText: {
    fontSize: 16,
    color: "white",
    fontWeight: "bold",
  },
});
