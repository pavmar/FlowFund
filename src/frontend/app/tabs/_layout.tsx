import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons'; // For tab icons

export default function TabsLayout() {
  return (
    <Tabs>
      {/* Home Tab */}
      <Tabs.Screen
        name="home" // Route for the home tab
        options={{
          title: 'Home', // Title of the tab
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home" size={size} color={color} /> // Tab icon
          ),
        }}
      />

      {/* Marketplace Tab */}
      <Tabs.Screen
        name="marketplace" // Route for the marketplace tab
        options={{
          title: 'Marketplace', // Title of the tab
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="cart" size={size} color={color} /> // Tab icon
          ),
        }}
      />

      {/* Wallet Tab */}
      <Tabs.Screen
        name="wallet" // Route for the wallet tab
        options={{
          title: 'Wallet', // Title of the tab
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="wallet" size={size} color={color} /> // Tab icon
          ),
        }}
      />

      {/* User Stats Tab */}
      <Tabs.Screen
        name="userStats" // Route for the user stats tab
        options={{
          title: 'Stats', // Title of the tab
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="stats-chart" size={size} color={color} /> // Tab icon
          ),
        }}
      />
    </Tabs>
  );
}