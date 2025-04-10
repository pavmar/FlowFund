import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';

const HomeScreen = () => {
  const navigation = useNavigation();

  useEffect(() => {
    // Wait for 5 seconds, then navigate to Login
    const timer = setTimeout(() => {
      navigation.replace('Login'); // Navigate without going back to Splash screen
    }, 5000);

    return () => clearTimeout(timer); // Cleanup the timer
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.appName}>FlowFund</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#2DAA9E', // Customize background color
  },
  appName: {
    fontSize: 40,
    fontWeight: 'bold',
    color: 'white',
  },
});

export default HomeScreen;
