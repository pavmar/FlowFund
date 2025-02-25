import * as React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import HomeScreen from './screens/HomeScreen';
import Login from './components/Login';
import CreateAccount from './components/CreateAccount';
import MarketPlace from './components/MarketPlace';
import Wallet from './components/Wallet';
import UserStats from './components/UserStats';

export type RootStackParamList = {
  Home: undefined;
  Login: undefined;
  CreateAccount: undefined;
  MarketPlace: undefined;
  Wallet: undefined;
  UserStats: undefined;
};

const Stack = createStackNavigator<RootStackParamList>();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Home">
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="Login" component={Login} />
        <Stack.Screen name="CreateAccount" component={CreateAccount} />
        <Stack.Screen name="MarketPlace" component={MarketPlace} />
        <Stack.Screen name="Wallet" component={Wallet} />
        <Stack.Screen name="UserStats" component={UserStats} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}