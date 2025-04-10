import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const Navbar = ({ username }: { username: string }) => {
  const navigation = useNavigation();

  const handleLogout = async () => {
    try {
      // Remove the token from AsyncStorage
      await AsyncStorage.removeItem('userToken');
      // Navigate to the login screen
      navigation.navigate('Login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <View style={styles.navbar}>
      <Text style={styles.username}>Welcome, {username}</Text>
      <View style={styles.navLinks}>
        <TouchableOpacity onPress={() => navigation.navigate('MainMenu')}>
          <Text style={styles.navLink}>Main Menu</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate('Wallet')}>
          <Text style={styles.navLink}>Wallet</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate('UserStats')}>
          <Text style={styles.navLink}>User Stats</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate('MarketPlace')}>
          <Text style={styles.navLink}>Marketplace</Text>
        </TouchableOpacity>
      </View>
      <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  navbar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 10,
    backgroundColor: '#2DAA9E',
  },
  username: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '600',
  },
  navLinks: {
    flexDirection: 'row',
    gap: 15,
  },
  navLink: {
    color: '#fff',
    fontWeight: '600',
  },
  logoutButton: {
    backgroundColor: '#fff',
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 5,
  },
  logoutText: {
    color: '#2DAA9E',
    fontWeight: '600',
  },
});

export default Navbar;