import { Stack } from "expo-router";

export default function MyAppNavigation() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ title: "Login" }} />
      <Stack.Screen name="register" options={{ title: "Register" }} />
      <Stack.Screen name="home" options={{ title: "Home" }} />
      <Stack.Screen
        name="workout-options"
        options={{ title: "Workout Options" }}
      />
    </Stack>
  );
}
