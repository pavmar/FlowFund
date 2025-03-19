import { Stack } from 'expo-router';
import NavBar from './components/Navbar'; // Import your NavBar component

export default function RootLayout() {
  return (
    <>
      {/* Add the NavBar here */}
      <NavBar />

      {/* Stack Navigator */}
      <Stack>
        {/* Home Screen */}
        <Stack.Screen
          name="index" // Default route (home screen)
          options={{ headerShown: false }} // Hide the default header for the home screen
        />

        {/* Login Screen */}
        <Stack.Screen
          name="login" // Route for the login screen
          options={{ headerShown: false }} // Hide the default header for the login screen
        />

        {/* Register Screen */}
        <Stack.Screen
          name="register" // Route for the register screen
          options={{ headerShown: false }} // Hide the default header for the register screen
        />

        {/* Tabs Group */}
        <Stack.Screen
          name="(tabs)" // Route for the tabs group
          options={{ headerShown: false }} // Hide the default header for tabs
        />
      </Stack>
    </>
  );
}