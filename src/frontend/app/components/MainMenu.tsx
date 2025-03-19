// import React from 'react';
// import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
// import { useNavigation } from '@react-navigation/native';
// const MainMenu = () => {
//   const navigation = useNavigation();

//   return (
//     <View style={styles.container}>
//       <Text style={styles.title}>Choose an Option</Text>
      
      
//       <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('MarketPlace')}>
//         <Text style={styles.buttonText}>Go to MarketPlace</Text>
//       </TouchableOpacity>

//       <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('Wallet')}>
//         <Text style={styles.buttonText}>Go to Wallet</Text>
//       </TouchableOpacity>

//       <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('UserStats')}>
//         <Text style={styles.buttonText}>View User Stats</Text>
//       </TouchableOpacity>
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//     backgroundColor: '#F5F5F5',
//   },
//   title: {
//     fontSize: 24,
//     fontWeight: 'bold',
//     marginBottom: 20,
//   },
//   button: {
//     backgroundColor: '#2DAA9E',
//     padding: 15,
//     marginVertical: 10,
//     width: '80%',
//     alignItems: 'center',
//     borderRadius: 8,
//   },
//   buttonText: {
//     color: '#fff',
//     fontSize: 18,
//   },
// });

// export default MainMenu;


import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import jwtDecode from 'jwt-decode';

const MainMenu = () => {
  const navigation = useNavigation();
  const [user, setUser] = useState({ fullName: '', email: '' });

  // Fetch user details from the token
  useEffect(() => {
    const fetchUserDetails = async () => {
      try {
        const token = await AsyncStorage.getItem('userToken');
        if (token) {
          const decoded = jwtDecode(token); // Decode the token
          setUser({ fullName: decoded.fullName, email: decoded.email }); // Set user details
        }
      } catch (error) {
        console.error('Error fetching user details:', error);
      }
    };

    fetchUserDetails();
  }, []);

  // Logout function
  const logout = async () => {
    try {
      await AsyncStorage.removeItem('userToken'); // Clear the token
      navigation.navigate('Login'); // Redirect to the login screen
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  return (
    <View style={styles.container}>
      {/* Display username and email */}
      <Text style={styles.title}>Welcome, {user.fullName}</Text>
      <Text style={styles.subtitle}>{user.email}</Text>

      {/* Navigation buttons */}
      <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('MarketPlace')}>
        <Text style={styles.buttonText}>Go to MarketPlace</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('Wallet')}>
        <Text style={styles.buttonText}>Go to Wallet</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('UserStats')}>
        <Text style={styles.buttonText}>View User Stats</Text>
      </TouchableOpacity>

      {/* Logout button */}
      <TouchableOpacity style={[styles.button, styles.logoutButton]} onPress={logout}>
        <Text style={styles.buttonText}>Logout</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#2DAA9E',
    padding: 15,
    marginVertical: 10,
    width: '80%',
    alignItems: 'center',
    borderRadius: 8,
  },
  logoutButton: {
    backgroundColor: 'red', // Different color for logout button
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
});

export default MainMenu;