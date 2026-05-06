import React from 'react';
import { View, Text } from 'react-native';
import { NavigationContainer, DarkTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import LoginScreen from './screens/LoginScreen';
import RegisterScreen from './screens/RegisterScreen';
import DashboardScreen from './screens/DashboardScreen';
import MatchEntryScreen from './screens/MatchEntryScreen';
import FriendsScreen from './screens/FriendsScreen';
import RankingScreen from './screens/RankingScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// ──────────────────────────────────────────
// Thème sombre global
// ──────────────────────────────────────────
const MyTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    background: '#0a0a0a',
    card: '#0f0f0f',
    text: '#ffffff',
    border: '#1a1a1a',
    primary: '#4fc3f7',
  },
};

// ──────────────────────────────────────────
// Icônes SVG-less (emoji / texte) pour les tabs
// ──────────────────────────────────────────
function TabIcon({ emoji, label, focused }) {
  return (
    <View style={{ alignItems: 'center', justifyContent: 'center' }}>
      <Text style={{ fontSize: 20, opacity: focused ? 1 : 0.45 }}>{emoji}</Text>
    </View>
  );
}

// ──────────────────────────────────────────
// Stack dans l'onglet "Profil" (Dashboard + sous-écrans)
// ──────────────────────────────────────────
function ProfileStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: '#0f0f0f' },
        headerTintColor: '#fff',
        headerTitleStyle: { fontWeight: 'bold', letterSpacing: 0.5 },
        headerShadowVisible: false,
      }}
    >
      <Stack.Screen
        name="Dashboard"
        component={DashboardScreen}
        options={{ title: 'Mon Profil' }}
      />
      <Stack.Screen
        name="MatchEntry"
        component={MatchEntryScreen}
        options={{ title: 'Nouveau Match' }}
      />
    </Stack.Navigator>
  );
}

// ──────────────────────────────────────────
// Bottom Tab Navigator (affiché après connexion)
// ──────────────────────────────────────────
function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#0f0f0f',
          borderTopColor: '#1a1a1a',
          borderTopWidth: 1,
          height: 64,
          paddingBottom: 8,
          paddingTop: 6,
        },
        tabBarActiveTintColor: '#4fc3f7',
        tabBarInactiveTintColor: '#444',
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
          letterSpacing: 0.5,
        },
      }}
    >
      <Tab.Screen
        name="ProfileTab"
        component={ProfileStack}
        options={{
          tabBarLabel: 'Profil',
          tabBarIcon: ({ focused }) => <TabIcon emoji="👤" focused={focused} />,
        }}
      />
      <Tab.Screen
        name="RankingTab"
        component={RankingScreen}
        options={{
          tabBarLabel: 'Classement',
          tabBarIcon: ({ focused }) => <TabIcon emoji="🏆" focused={focused} />,
          headerShown: true,
          headerTitle: 'Classement',
          headerStyle: { backgroundColor: '#0f0f0f' },
          headerTintColor: '#fff',
          headerTitleStyle: { fontWeight: 'bold', letterSpacing: 0.5 },
          headerShadowVisible: false,
        }}
      />
      <Tab.Screen
        name="FriendsTab"
        component={FriendsScreen}
        options={{
          tabBarLabel: 'Amis',
          tabBarIcon: ({ focused }) => <TabIcon emoji="🤝" focused={focused} />,
          headerShown: true,
          headerTitle: 'Mes Amis',
          headerStyle: { backgroundColor: '#0f0f0f' },
          headerTintColor: '#fff',
          headerTitleStyle: { fontWeight: 'bold', letterSpacing: 0.5 },
          headerShadowVisible: false,
        }}
      />
    </Tab.Navigator>
  );
}

// ──────────────────────────────────────────
// Root Navigator (Auth + Main)
// ──────────────────────────────────────────
export default function App() {
  return (
    <NavigationContainer theme={MyTheme}>
      <Stack.Navigator
        initialRouteName="Login"
        screenOptions={{ headerShown: false }}
      >
        {/* ── Écrans d'authentification ── */}
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen
          name="Register"
          component={RegisterScreen}
          options={{
            headerShown: true,
            title: 'Inscription',
            headerStyle: { backgroundColor: '#0f0f0f' },
            headerTintColor: '#fff',
            headerShadowVisible: false,
          }}
        />

        {/* ── Application principale (après connexion) ── */}
        <Stack.Screen name="Main" component={MainTabs} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
