import React from 'react';
import { NavigationContainer, DarkTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import LoginScreen from './screens/LoginScreen';
import RegisterScreen from './screens/RegisterScreen';
import DashboardScreen from './screens/DashboardScreen';
import MatchEntryScreen from './screens/MatchEntryScreen';
import FriendsScreen from './screens/FriendsScreen';

const Stack = createNativeStackNavigator();

const MyTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    background: '#0a0a0a',
    card: '#1a1a1a',
    text: '#ffffff',
    border: '#333333',
    primary: '#ffffff',
  },
};

export default function App() {
  return (
    <NavigationContainer theme={MyTheme}>
      <Stack.Navigator 
        initialRouteName="Login"
        screenOptions={{
          headerStyle: { backgroundColor: '#1a1a1a' },
          headerTintColor: '#fff',
          headerTitleStyle: { fontWeight: 'bold' },
        }}
      >
        <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
        <Stack.Screen name="Register" component={RegisterScreen} options={{ title: 'Inscription' }} />
        <Stack.Screen name="Dashboard" component={DashboardScreen} options={{ title: 'Mon Profil' }} />
        <Stack.Screen name="MatchEntry" component={MatchEntryScreen} options={{ title: 'Nouveau Match' }} />
        <Stack.Screen name="Friends" component={FriendsScreen} options={{ title: 'Mes Amis' }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
