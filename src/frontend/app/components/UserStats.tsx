// import React from 'react';
// import { View, Text, StyleSheet } from 'react-native';

// const UserStats = () => {
//   return (
//     <View style={styles.container}>
//       <Text style={styles.title}>User Stats</Text>
//       <Text>Username: JohnDoe</Text>
//       <Text>Credit Score: 800</Text>
//       <Text>Verified Status: Yes</Text>
//       <Text>Total Loan Amount: $500</Text>
//       <Text>Transaction History:</Text>
//       <Text>$500 borrowed on 02/19/2025</Text>
//       <Text>$1000 lent on 02/14/2025</Text>
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   title: {
//     fontSize: 24,
//     marginBottom: 20,
//   },
// });

// export default UserStats;


import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

const UserStats = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>User Stats</Text>
      <View style={styles.userInfoContainer}>
        <Text style={styles.userInfoText}>Username: JohnDoe</Text>

        {/* Circle containers side by side */}
        <View style={styles.circlesRow}>
          <View style={styles.circleContainer}>
            <Text>Credit Score: </Text>
            <Text style={styles.circleText}>800</Text>
          </View>
          <View style={styles.circleContainer}>
            <Text>Verified Status: </Text>
            <Text style={styles.circleText}>Yes</Text>
          </View>
        </View>

        <Text style={styles.userInfoText}>Total Loan Amount: $500</Text>
      </View>

      <Text style={styles.historyTitle}>Transaction History:</Text>
      <View style={styles.transactionContainer}>
        <Text style={styles.transactionText}>$500 borrowed on 02/19/2025</Text>
        <Text style={styles.transactionText}>$1000 lent on 02/14/2025</Text>
      </View>
      <TouchableOpacity style={styles.button}>
        <Text style={styles.buttonText}>Edit Stats</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center', // Center content vertically
    alignItems: 'center', // Center content horizontally
    padding: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 20,
  },
  userInfoContainer: {
    marginBottom: 20,
    alignItems: 'center', // Center text horizontally
  },
  userInfoText: {
    fontSize: 18,
    color: '#333',
    marginBottom: 10,
  },
  historyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2DAA9E',
    marginBottom: 15,
    textAlign: 'center', // Center the title
  },
  transactionContainer: {
    marginBottom: 30,
    alignItems: 'center', // Center transaction history text
    backgroundColor: '#E3B10B', // Set background color to #E3B10B
    padding: 20, // Added padding for the container
    borderRadius: 8, // Optional: rounded corners for the container
  },
  transactionText: {
    fontSize: 16,
    color: '#333', // Text color remains the same
    marginBottom: 8,
    textAlign: 'center', // Center transaction text
  },
  circlesRow: {
    flexDirection: 'row', // Arrange circles side by side
    justifyContent: 'center', // Center the circles
    width: '100%', // Use full width to ensure it's centered properly
    marginBottom: 20, // Space below the circles
  },
  circleContainer: {
    backgroundColor: '#2F8F23', // Green background color for the circle
    width: 120, // Increased size for the circle
    height: 120, // Increased height for the circle
    borderRadius: 60, // Make it circular
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 20, // Space between the circles
    padding: 10, // Added padding for better text positioning
  },
  circleText: {
    fontSize: 18,
    color: '#CBE21A', // Text color inside the circle
    fontWeight: 'bold',
    textAlign: 'center', // Center the text inside the circle
  },
  button: {
    backgroundColor: '#2DAA9E',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  buttonText: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '600',
  },
});

export default UserStats;
