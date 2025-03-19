import * as React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { ApolloProvider } from '@apollo/client';
import client from './apolloClient';
import HomeScreen from './screens/HomeScreen'; // Import the splash screen
import Login from './components/Login';
import CreateAccount from './components/CreateAccount';
import MainMenu from './components/MainMenu';
import MarketPlace from './components/MarketPlace';
import Wallet from './components/Wallet';
import UserStats from './components/UserStats';

export type RootStackParamList = {
  Home: undefined;
  Login: undefined;
  CreateAccount: undefined;
  MainMenu: undefined;
  MarketPlace: undefined;
  Wallet: undefined;
  UserStats: undefined;
};

const Stack = createStackNavigator<RootStackParamList>();

export default function App() {
  return (
    <ApolloProvider client={client}>
      <NavigationContainer>
        <Stack.Navigator initialRouteName="Home" screenOptions={{ headerShown: false }}>
          <Stack.Screen name="Home" component={HomeScreen} />
          <Stack.Screen name="Login" component={Login} />
          <Stack.Screen name="CreateAccount" component={CreateAccount} />
          <Stack.Screen name="MainMenu" component={MainMenu} />
          <Stack.Screen name="MarketPlace" component={MarketPlace} />
          <Stack.Screen name="Wallet" component={Wallet} />
          <Stack.Screen name="UserStats" component={UserStats} />
        </Stack.Navigator>
      </NavigationContainer>
    </ApolloProvider>
  );
}
