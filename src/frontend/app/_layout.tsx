import { Stack } from 'expo-router';

export default function RootLayout() {
  return (
    <Stack>
      {/* Home Screen */}
      <Stack.Screen
        name="index" // Default route (home screen)
        options={{ headerShown: false }} // Hide the header for the home screen
      />

      {/* Login Screen */}
      <Stack.Screen
        name="login" // Route for the login screen
        options={{ title: 'Login' }} // Set the title for the screen
      />

      {/* Register Screen */}
      <Stack.Screen
        name="register" // Route for the register screen
        options={{ title: 'Register' }} // Set the title for the screen
      />

      {/* Tabs Group */}
      <Stack.Screen
        name="(tabs)" // Route for the tabs group
        options={{ headerShown: false }} // Hide the header for tabs
      />

      {/* Transaction History Screen */}
      <Stack.Screen
        name="transactionHistory" // Route for the transaction history screen
        options={{ title: 'Transaction History' }} // Set the title for the screen
      />
    </Stack>
  );
}