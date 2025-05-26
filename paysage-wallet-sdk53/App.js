import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, ActivityIndicator, SafeAreaView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

// Import all screens
import HomeScreen from './screens/HomeScreen';
import WalletScreen from './screens/WalletScreen';
import TenantSelectionScreen from './screens/TenantSelectionScreen';
import SettingsScreen from './screens/SettingsScreen';
import TransactionsScreen from './screens/TransactionsScreen';
import ProfileScreen from './screens/ProfileScreen';
import LoginScreen from './screens/LoginScreen';
import SendMoneyScreen from './screens/SendMoneyScreen';
import AddMoneyScreen from './screens/AddMoneyScreen';
import CardsScreen from './screens/CardsScreen';
import CarbonImpactScreen from './screens/CarbonImpactScreen';

// Auth context
import { AuthProvider, useAuth } from './context/AuthContext';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

// Main app navigation when logged in
const MainTabs = () => {
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
};

// Main navigation container
const AppNavigator = () => {
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
};

// Root app component
const App = () => {
  return (
    <AuthProvider>
      <SafeAreaView style={styles.container}>
        <StatusBar style="auto" />
        <AppNavigator />
      </SafeAreaView>
    </AuthProvider>
  );
};

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

export default App;
