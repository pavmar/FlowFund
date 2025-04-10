import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const UserStats = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>User Stats</Text>
      <Text>Username: JohnDoe</Text>
      <Text>Credit Score: 800</Text>
      <Text>Verified Status: Yes</Text>
      <Text>Total Loan Amount: $500</Text>
      <Text>Transaction History:</Text>
      <Text>$500 borrowed on 02/19/2025</Text>
      <Text>$1000 lent on 02/14/2025</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
  },
});

export default UserStats;