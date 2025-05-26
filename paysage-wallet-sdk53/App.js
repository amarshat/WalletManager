import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, ActivityIndicator, SafeAreaView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

// Import screens - create placeholder imports for any missing screens
import HomeScreen from './screens/HomeScreen';
import WalletScreen from './screens/WalletScreen';
import TenantSelectionScreen from './screens/TenantSelectionScreen';
import SettingsScreen from './screens/SettingsScreen';
// Import other screens based on what you've implemented
let TransactionsScreen, ProfileScreen, LoginScreen, SendMoneyScreen, 
    AddMoneyScreen, CardsScreen, CarbonImpactScreen;

try {
  TransactionsScreen = require('./screens/TransactionsScreen').default;
} catch (e) {
  TransactionsScreen = () => <View style={{flex:1, justifyContent:'center', alignItems:'center'}}><Text>Transactions Screen</Text></View>;
}

try {
  ProfileScreen = require('./screens/ProfileScreen').default;
} catch (e) {
  ProfileScreen = () => <View style={{flex:1, justifyContent:'center', alignItems:'center'}}><Text>Profile Screen</Text></View>;
}

try {
  LoginScreen = require('./screens/LoginScreen').default;
} catch (e) {
  LoginScreen = () => <View style={{flex:1, justifyContent:'center', alignItems:'center'}}><Text>Login Screen</Text></View>;
}

try {
  SendMoneyScreen = require('./screens/SendMoneyScreen').default;
} catch (e) {
  SendMoneyScreen = () => <View style={{flex:1, justifyContent:'center', alignItems:'center'}}><Text>Send Money Screen</Text></View>;
}

try {
  AddMoneyScreen = require('./screens/AddMoneyScreen').default;
} catch (e) {
  AddMoneyScreen = () => <View style={{flex:1, justifyContent:'center', alignItems:'center'}}><Text>Add Money Screen</Text></View>;
}

try {
  CardsScreen = require('./screens/CardsScreen').default;
} catch (e) {
  CardsScreen = () => <View style={{flex:1, justifyContent:'center', alignItems:'center'}}><Text>Cards Screen</Text></View>;
}

try {
  CarbonImpactScreen = require('./screens/CarbonImpactScreen').default;
} catch (e) {
  CarbonImpactScreen = () => <View style={{flex:1, justifyContent:'center', alignItems:'center'}}><Text>Carbon Impact Screen</Text></View>;
}

// Auth context - create placeholder if missing
import { AuthProvider, useAuth } from './context/AuthContext';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

// Main app navigation when logged in
function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === 'Home') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Wallet') {
            iconName = focused ? 'wallet' : 'wallet-outline';
          } else if (route.name === 'Transactions') {
            iconName = focused ? 'time' : 'time-outline';
          } else if (route.name === 'Profile') {
            iconName = focused ? 'person' : 'person-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#4f46e5',
        tabBarInactiveTintColor: 'gray',
        headerShown: true,
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} options={{ title: 'Dashboard' }} />
      <Tab.Screen name="Wallet" component={WalletScreen} options={{ title: 'My Wallet' }} />
      <Tab.Screen name="Transactions" component={TransactionsScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

// Main navigation container
function AppNavigator() {
  const { user, isLoading } = useAuth();
  
  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4f46e5" />
        <Text style={styles.loadingText}>Loading PaySage Wallet...</Text>
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {user ? (
          <>
            <Stack.Screen name="MainTabs" component={MainTabs} />
            <Stack.Screen 
              name="SendMoney" 
              component={SendMoneyScreen} 
              options={{ 
                headerShown: true, 
                title: 'Send Money',
                presentation: 'modal'
              }} 
            />
            <Stack.Screen 
              name="AddMoney" 
              component={AddMoneyScreen} 
              options={{ 
                headerShown: true, 
                title: 'Add Money',
                presentation: 'modal'
              }} 
            />
            <Stack.Screen 
              name="Cards" 
              component={CardsScreen} 
              options={{ 
                headerShown: true, 
                title: 'My Cards' 
              }} 
            />
            <Stack.Screen 
              name="CarbonImpact" 
              component={CarbonImpactScreen} 
              options={{ 
                headerShown: true, 
                title: 'Carbon Impact' 
              }} 
            />
          </>
        ) : (
          <>
            <Stack.Screen name="TenantSelection" component={TenantSelectionScreen} />
            <Stack.Screen name="Login" component={LoginScreen} />
          </>
        )}
        <Stack.Screen 
          name="Settings" 
          component={SettingsScreen} 
          options={{ 
            headerShown: true, 
            title: 'Settings',
            presentation: 'modal'
          }} 
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <SafeAreaView style={styles.container}>
        <StatusBar style="auto" />
        <AppNavigator />
      </SafeAreaView>
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#4f46e5',
  },
});
