#!/bin/bash

# Script to migrate PaySage Wallet mobile app to Expo SDK 53
# This will create a new project and copy all relevant files

# Set colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Print section header
section() {
  echo -e "\n${GREEN}==== $1 ====${NC}\n"
}

# Print progress
progress() {
  echo -e "${YELLOW}➜ $1${NC}"
}

# Print error
error() {
  echo -e "${RED}✗ ERROR: $1${NC}"
}

# Directory where the new project will be created
PARENT_DIR="$(dirname "$(pwd)")"
NEW_PROJECT_NAME="paysage-wallet-sdk53"
NEW_PROJECT_PATH="$PARENT_DIR/$NEW_PROJECT_NAME"

# Source project directory (current directory)
SOURCE_DIR="$(pwd)"

section "Starting PaySage Wallet migration to Expo SDK 53"

# Check if expo-cli is installed
progress "Checking prerequisites..."
if ! command -v npx &> /dev/null; then
  error "npx is not installed. Please install Node.js and npm."
  exit 1
fi

# Create new project with Expo SDK 53
section "Creating new Expo SDK 53 project"

# Clean up any existing project directory
if [ -d "$NEW_PROJECT_PATH" ]; then
  progress "Removing existing project directory..."
  rm -rf "$NEW_PROJECT_PATH"
fi

progress "Initializing new project: $NEW_PROJECT_NAME"

cd "$PARENT_DIR" || { error "Could not navigate to parent directory"; exit 1; }

# Create new project with Expo SDK 53 template
npx create-expo-app@latest -t blank@sdk-53 "$NEW_PROJECT_NAME" || { 
  error "Failed to create new Expo project"
  exit 1
}

# Navigate to the new project
cd "$NEW_PROJECT_NAME" || { error "Could not navigate to new project"; exit 1; }

section "Installing dependencies"
progress "Installing required packages..."

# Install necessary dependencies
npm install @react-native-async-storage/async-storage \
  @react-navigation/bottom-tabs \
  @react-navigation/native \
  @react-navigation/native-stack \
  expo-linear-gradient \
  react-native-gesture-handler \
  react-native-reanimated \
  react-native-safe-area-context \
  react-native-screens \
  react-native-svg

section "Creating directory structure"
# Create necessary directories
mkdir -p screens context api assets

# Copy screens
section "Copying screens and components"
progress "Copying screens..."
cp -R "$SOURCE_DIR/screens/"* "./screens/" 2>/dev/null || progress "No screens found to copy (will create later)"

progress "Copying API client..."
cp -R "$SOURCE_DIR/api/"* "./api/" 2>/dev/null || progress "No API files found to copy (will create later)"

progress "Copying context files..."
cp -R "$SOURCE_DIR/context/"* "./context/" 2>/dev/null || progress "No context files found to copy (will create later)"

progress "Copying assets..."
cp -R "$SOURCE_DIR/assets/"* "./assets/" 2>/dev/null || progress "No assets found to copy (will create later)"

# Update app.json
section "Configuring app.json"
progress "Updating app configuration..."

cat > app.json << 'EOL'
{
  "expo": {
    "name": "PaySage Wallet",
    "slug": "paysage-wallet",
    "version": "1.0.0",
    "orientation": "portrait",
    "icon": "./assets/icon.png",
    "userInterfaceStyle": "light",
    "splash": {
      "image": "./assets/splash.png",
      "resizeMode": "contain",
      "backgroundColor": "#4F46E5"
    },
    "assetBundlePatterns": [
      "**/*"
    ],
    "ios": {
      "supportsTablet": true,
      "bundleIdentifier": "com.paysage.wallet",
      "infoPlist": {
        "ITSAppUsesNonExemptEncryption": false
      }
    },
    "android": {
      "adaptiveIcon": {
        "foregroundImage": "./assets/adaptive-icon.png",
        "backgroundColor": "#ffffff"
      },
      "package": "com.paysage.wallet"
    },
    "web": {
      "favicon": "./assets/favicon.png"
    }
  }
}
EOL

# Create/update metro.config.js
section "Configuring Metro bundler"
progress "Creating metro.config.js..."

cat > metro.config.js << 'EOL'
// Learn more https://docs.expo.io/guides/customizing-metro
const { getDefaultConfig } = require('expo/metro-config');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// Configure the resolver for Metro
config.resolver.sourceExts = ['js', 'jsx', 'json', 'ts', 'tsx', 'cjs'];
config.resolver.assetExts = [
  'bmp', 'gif', 'jpg', 'jpeg', 'png', 'psd', 'svg', 'webp',
  'ttf', 'otf', 'woff', 'woff2',
  'mp4', 'mov', 'mp3', 'wav'
];

module.exports = config;
EOL

# Create/update babel.config.js
section "Configuring Babel"
progress "Creating babel.config.js..."

cat > babel.config.js << 'EOL'
module.exports = function(api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      'react-native-reanimated/plugin',
    ],
  };
};
EOL

# Update App.js with navigation setup
section "Setting up navigation"
progress "Creating main App.js file..."

cat > App.js << 'EOL'
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
          <Stack.Screen name="Login" component={LoginScreen} />
        )}
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
EOL

# Create API client if it doesn't exist yet
if [ ! -f "./api/client.js" ]; then
  section "Creating API client"
  progress "Creating api/client.js..."
  
  cat > ./api/client.js << 'EOL'
import AsyncStorage from '@react-native-async-storage/async-storage';

// API base URL - change this to your server URL when deploying
const API_URL = 'https://paysage-wallet.example.com/api';

/**
 * API client for making requests to the server
 */
export const apiClient = {
  /**
   * Make a request to the API
   * @param {string} endpoint - The API endpoint to request
   * @param {Object} options - Request options (method, headers, body)
   * @returns {Promise<any>} Response data
   */
  async request(endpoint, options = {}) {
    const url = `${API_URL}${endpoint}`;
    
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    const config = {
      method: options.method || 'GET',
      headers,
      ...options,
    };

    if (options.body) {
      config.body = JSON.stringify(options.body);
    }

    try {
      const response = await fetch(url, config);
      
      if (response.status === 204) {
        return null; // No content
      }
      
      const data = await response.json();
      
      if (response.ok) {
        return data;
      } else {
        return Promise.reject(data);
      }
    } catch (error) {
      console.error(`API Error: ${endpoint}`, error);
      return Promise.reject(error);
    }
  },

  // Auth endpoints
  auth: {
    login: (credentials) => apiClient.request('/login', { 
      method: 'POST', 
      body: credentials 
    }),
    register: (userData) => apiClient.request('/register', { 
      method: 'POST', 
      body: userData 
    }),
    logout: () => apiClient.request('/logout', { method: 'POST' }),
    getCurrentUser: () => apiClient.request('/user'),
  },

  // Wallet endpoints
  wallet: {
    getBalance: () => apiClient.request('/wallet/balance'),
    getAccounts: () => apiClient.request('/wallet/accounts'),
    addMoney: (data) => apiClient.request('/wallet/deposit', { 
      method: 'POST', 
      body: data 
    }),
    sendMoney: (data) => apiClient.request('/wallet/transfer', { 
      method: 'POST', 
      body: data 
    }),
    withdrawMoney: (data) => apiClient.request('/wallet/withdraw', { 
      method: 'POST', 
      body: data 
    }),
  },

  // Transaction endpoints
  transactions: {
    getAll: (limit = 20) => apiClient.request(`/transactions?limit=${limit}`),
    getById: (id) => apiClient.request(`/transactions/${id}`),
  },

  // Card endpoints
  cards: {
    getAll: () => apiClient.request('/cards'),
    create: (cardData) => apiClient.request('/cards', { 
      method: 'POST', 
      body: cardData 
    }),
    update: (id, cardData) => apiClient.request(`/cards/${id}`, { 
      method: 'PATCH', 
      body: cardData 
    }),
    delete: (id) => apiClient.request(`/cards/${id}`, { 
      method: 'DELETE' 
    }),
  },

  // Prepaid card endpoints
  prepaidCards: {
    getAll: () => apiClient.request('/prepaid-cards'),
    getById: (id) => apiClient.request(`/prepaid-cards/${id}`),
    create: (cardData) => apiClient.request('/prepaid-cards', { 
      method: 'POST', 
      body: cardData 
    }),
  },

  // Carbon impact endpoints
  carbon: {
    getCategories: () => apiClient.request('/carbon/categories'),
    getPreferences: () => apiClient.request('/carbon/preferences'),
    updatePreferences: (data) => apiClient.request('/carbon/preferences', { 
      method: 'POST', 
      body: data 
    }),
    getImpacts: () => apiClient.request('/carbon/impacts'),
    getSummary: () => apiClient.request('/carbon/summary'),
    getOffsets: () => apiClient.request('/carbon/offsets'),
    createOffset: (data) => apiClient.request('/carbon/offsets', { 
      method: 'POST', 
      body: data 
    }),
  },
};
EOL
fi

# Create AuthContext if it doesn't exist yet
if [ ! -f "./context/AuthContext.js" ]; then
  section "Creating Auth Context"
  progress "Creating context/AuthContext.js..."
  
  cat > ./context/AuthContext.js << 'EOL'
import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { apiClient } from '../api/client';

// Create the auth context
const AuthContext = createContext();

// Provider component that wraps the app and provides auth context
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Check if user is logged in on app start
  useEffect(() => {
    const checkLoginStatus = async () => {
      try {
        // For demo purposes, simulate loading
        setTimeout(() => {
          // Simulate a user for testing
          setUser({ id: 1, username: 'demo_user' });
          setIsLoading(false);
        }, 1500);
      } catch (error) {
        console.log('Not authenticated', error);
        setUser(null);
        setIsLoading(false);
      }
    };

    checkLoginStatus();
  }, []);

  // Login function
  const login = async (username, password) => {
    try {
      setIsLoading(true);
      setError(null);
      
      // For demo purposes, simulate successful login
      if (username && password) {
        setUser({ id: 1, username });
        return { id: 1, username };
      } else {
        throw new Error('Invalid username or password');
      }
    } catch (error) {
      setError(error.message || 'Failed to login');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Register function
  const register = async (userData) => {
    try {
      setIsLoading(true);
      setError(null);
      
      // For demo purposes, simulate successful registration
      if (userData.username && userData.password) {
        const newUser = { id: 1, ...userData };
        setUser(newUser);
        return newUser;
      } else {
        throw new Error('Invalid registration data');
      }
    } catch (error) {
      setError(error.message || 'Failed to register');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Logout function
  const logout = async () => {
    try {
      setIsLoading(true);
      setUser(null);
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Context values to provide
  const value = {
    user,
    isLoading,
    error,
    login,
    register,
    logout
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Custom hook to use the auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
EOL
fi

# Create placeholder screens if they are missing
if [ ! -f "./screens/HomeScreen.js" ]; then
  section "Creating Placeholder Screens"
  progress "Creating HomeScreen.js placeholder..."
  mkdir -p ./screens
  
  cat > ./screens/HomeScreen.js << 'EOL'
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function HomeScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Home Screen</Text>
      <Text style={styles.description}>
        This is a placeholder. Copy your actual HomeScreen implementation here.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  description: {
    fontSize: 16,
    textAlign: 'center',
  },
});
EOL
fi

if [ ! -f "./screens/WalletScreen.js" ]; then
  progress "Creating WalletScreen.js placeholder..."
  
  cat > ./screens/WalletScreen.js << 'EOL'
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function WalletScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Wallet Screen</Text>
      <Text style={styles.description}>
        This is a placeholder. Copy your actual WalletScreen implementation here.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  description: {
    fontSize: 16,
    textAlign: 'center',
  },
});
EOL
fi

# Create components directory and TransactionItem component
section "Creating Additional Components"
progress "Creating components directory..."
mkdir -p ./components

progress "Creating TransactionItem component..."
cat > ./components/TransactionItem.js << 'EOL'
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function TransactionItem({ transaction, onPress }) {
  const formatCurrency = (amount, currency = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
    }).format(amount);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }).format(date);
  };

  // Get transaction icon based on type
  const getTransactionIcon = (type) => {
    switch (type) {
      case 'deposit':
        return <Ionicons name="arrow-down-circle" size={24} color="#10b981" />;
      case 'withdrawal':
        return <Ionicons name="arrow-up-circle" size={24} color="#ef4444" />;
      case 'transfer':
        return <Ionicons name="swap-horizontal" size={24} color="#6366f1" />;
      case 'payment':
        return <Ionicons name="cart" size={24} color="#f59e0b" />;
      default:
        return <Ionicons name="ellipsis-horizontal" size={24} color="#6b7280" />;
    }
  };

  return (
    <TouchableOpacity 
      style={styles.container} 
      onPress={() => onPress && onPress(transaction)}
    >
      <View style={styles.iconContainer}>
        {getTransactionIcon(transaction.type)}
      </View>
      
      <View style={styles.details}>
        <Text style={styles.description}>{transaction.description}</Text>
        <Text style={styles.date}>{formatDate(transaction.date)}</Text>
      </View>
      
      <Text
        style={[
          styles.amount,
          { color: transaction.amount < 0 ? '#ef4444' : '#10b981' },
        ]}
      >
        {formatCurrency(transaction.amount, transaction.currency)}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 4,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  details: {
    flex: 1,
  },
  description: {
    fontSize: 16,
    color: '#1f2937',
    marginBottom: 4,
  },
  date: {
    fontSize: 14,
    color: '#6b7280',
  },
  amount: {
    fontSize: 16,
    fontWeight: '600',
  },
});
EOL

# Create CardsScreen if it doesn't exist
if [ ! -f "./screens/CardsScreen.js" ]; then
  progress "Creating CardsScreen.js..."
  
  cat > ./screens/CardsScreen.js << 'EOL'
import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
  ActivityIndicator,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';

export default function CardsScreen({ navigation }) {
  const { user } = useAuth();
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch cards data
  const fetchCards = async () => {
    try {
      setLoading(true);
      
      // Mock data for demonstration
      const mockCards = [
        { 
          id: 1, 
          type: 'visa', 
          name: 'PaySage Visa',
          number: '•••• •••• •••• 4321',
          expiryMonth: 9,
          expiryYear: 25,
          isDefault: true,
        },
        { 
          id: 2, 
          type: 'mastercard', 
          name: 'PaySage Credit',
          number: '•••• •••• •••• 5678',
          expiryMonth: 3,
          expiryYear: 26,
          isDefault: false,
        },
      ];
      
      // In a real app, fetch from API
      // const response = await apiClient.cards.getAll();
      
      setCards(mockCards);
    } catch (error) {
      console.error('Error fetching cards:', error);
      Alert.alert('Error', 'Failed to load cards. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCards();
  }, []);

  // Get card logo based on type
  const getCardLogo = (type) => {
    switch (type.toLowerCase()) {
      case 'visa':
        return require('../assets/visa-logo.png');
      case 'mastercard':
        return require('../assets/mastercard-logo.png');
      case 'amex':
        return require('../assets/amex-logo.png');
      default:
        return null;
    }
  };

  // Handle add new card
  const handleAddCard = () => {
    Alert.alert('Add Card', 'This feature will be implemented soon!');
  };

  // Handle card options
  const handleCardOptions = (card) => {
    Alert.alert(
      'Card Options',
      'What would you like to do with this card?',
      [
        {
          text: 'Set as Default',
          onPress: () => {
            // Set card as default
            Alert.alert('Success', 'Card set as default payment method');
          },
        },
        {
          text: 'Remove Card',
          style: 'destructive',
          onPress: () => {
            // Remove card
            Alert.alert('Success', 'Card has been removed');
          },
        },
        {
          text: 'Cancel',
          style: 'cancel',
        },
      ],
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4f46e5" />
        <Text style={styles.loadingText}>Loading your cards...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollContainer}>
        <View style={styles.headerContainer}>
          <Text style={styles.headerTitle}>Your Payment Cards</Text>
          <Text style={styles.headerSubtitle}>
            Manage your cards and payment methods
          </Text>
        </View>

        <View style={styles.cardsContainer}>
          {cards.map((card) => (
            <View key={card.id} style={styles.cardItem}>
              <View style={styles.cardHeader}>
                {getCardLogo(card.type) && (
                  <Image
                    source={getCardLogo(card.type)}
                    style={styles.cardLogo}
                    resizeMode="contain"
                  />
                )}
                <TouchableOpacity
                  onPress={() => handleCardOptions(card)}
                  style={styles.optionsButton}
                >
                  <Ionicons
                    name="ellipsis-vertical"
                    size={20}
                    color="#6b7280"
                  />
                </TouchableOpacity>
              </View>

              <Text style={styles.cardName}>{card.name}</Text>
              <Text style={styles.cardNumber}>{card.number}</Text>
              
              <View style={styles.cardFooter}>
                <Text style={styles.cardExpiry}>
                  Expires {card.expiryMonth < 10 ? `0${card.expiryMonth}` : card.expiryMonth}/{card.expiryYear}
                </Text>
                
                {card.isDefault && (
                  <View style={styles.defaultBadge}>
                    <Text style={styles.defaultBadgeText}>Default</Text>
                  </View>
                )}
              </View>
            </View>
          ))}

          <TouchableOpacity
            style={styles.addCardButton}
            onPress={handleAddCard}
          >
            <View style={styles.addCardIconContainer}>
              <Ionicons name="add" size={24} color="#4f46e5" />
            </View>
            <Text style={styles.addCardText}>Add New Card</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Security Settings</Text>
          
          <TouchableOpacity style={styles.settingItem}>
            <View style={styles.settingIconContainer}>
              <Ionicons name="lock-closed" size={20} color="#4f46e5" />
            </View>
            <View style={styles.settingContent}>
              <Text style={styles.settingTitle}>Payment Security</Text>
              <Text style={styles.settingDescription}>
                Configure security for your payment methods
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.settingItem}>
            <View style={styles.settingIconContainer}>
              <Ionicons name="finger-print" size={20} color="#4f46e5" />
            </View>
            <View style={styles.settingContent}>
              <Text style={styles.settingTitle}>Biometric Authentication</Text>
              <Text style={styles.settingDescription}>
                Enable fingerprint or face ID for payments
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  scrollContainer: {
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
  headerContainer: {
    padding: 20,
    paddingBottom: 16,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#6b7280',
  },
  cardsContainer: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  cardItem: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  cardLogo: {
    width: 50,
    height: 30,
  },
  optionsButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 8,
  },
  cardNumber: {
    fontSize: 16,
    color: '#4b5563',
    marginBottom: 16,
    letterSpacing: 1,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardExpiry: {
    fontSize: 14,
    color: '#6b7280',
  },
  defaultBadge: {
    backgroundColor: '#10b981',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  defaultBadgeText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '500',
  },
  addCardButton: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  addCardIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  addCardText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#4f46e5',
  },
  sectionContainer: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 16,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  settingIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  settingContent: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1f2937',
    marginBottom: 2,
  },
  settingDescription: {
    fontSize: 14,
    color: '#6b7280',
  },
});
EOL
fi

# Create TransactionsScreen if it doesn't exist
if [ ! -f "./screens/TransactionsScreen.js" ]; then
  progress "Creating TransactionsScreen.js..."
  
  cat > ./screens/TransactionsScreen.js << 'EOL'
import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  FlatList,
  RefreshControl,
  ActivityIndicator,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import TransactionItem from '../components/TransactionItem';

export default function TransactionsScreen({ navigation }) {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState('all'); // all, incoming, outgoing

  // Fetch transactions
  const fetchTransactions = async () => {
    try {
      setLoading(true);
      
      // Mock data for demonstration
      const mockTransactions = [
        { 
          id: 1, 
          type: 'deposit', 
          amount: 500, 
          currency: 'USD', 
          description: 'Salary payment',
          date: '2023-04-25T14:30:00Z'
        },
        { 
          id: 2, 
          type: 'transfer', 
          amount: -75.50, 
          currency: 'USD', 
          description: 'Transfer to John',
          date: '2023-04-24T09:15:00Z'
        },
        { 
          id: 3, 
          type: 'payment', 
          amount: -45.99, 
          currency: 'USD', 
          description: 'Amazon purchase',
          date: '2023-04-23T18:45:00Z'
        },
        { 
          id: 4, 
          type: 'deposit', 
          amount: 250, 
          currency: 'USD', 
          description: 'Freelance work',
          date: '2023-04-22T12:30:00Z'
        },
        { 
          id: 5, 
          type: 'withdrawal', 
          amount: -100, 
          currency: 'USD', 
          description: 'ATM withdrawal',
          date: '2023-04-21T16:20:00Z'
        },
        { 
          id: 6, 
          type: 'payment', 
          amount: -35.25, 
          currency: 'USD', 
          description: 'Restaurant bill',
          date: '2023-04-20T20:10:00Z'
        },
        { 
          id: 7, 
          type: 'transfer', 
          amount: -200, 
          currency: 'USD', 
          description: 'Rent payment',
          date: '2023-04-19T09:00:00Z'
        },
      ];
      
      // In a real app, fetch from API
      // const response = await apiClient.transactions.getAll();
      
      setTransactions(mockTransactions);
    } catch (error) {
      console.error('Error fetching transactions:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Load transactions on initial render
  useEffect(() => {
    fetchTransactions();
  }, []);

  // Handle pull-to-refresh
  const onRefresh = () => {
    setRefreshing(true);
    fetchTransactions();
  };

  // Filter transactions based on selected filter
  const getFilteredTransactions = () => {
    switch (filter) {
      case 'incoming':
        return transactions.filter(t => t.amount > 0);
      case 'outgoing':
        return transactions.filter(t => t.amount < 0);
      default:
        return transactions;
    }
  };

  // Handle transaction item press
  const handleTransactionPress = (transaction) => {
    // Navigate to transaction details or show in modal
    console.log('Transaction pressed:', transaction);
  };

  if (loading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4f46e5" />
        <Text style={styles.loadingText}>Loading transactions...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Filter buttons */}
      <View style={styles.filterContainer}>
        <TouchableOpacity
          style={[
            styles.filterButton,
            filter === 'all' && styles.activeFilterButton,
          ]}
          onPress={() => setFilter('all')}
        >
          <Text
            style={[
              styles.filterButtonText,
              filter === 'all' && styles.activeFilterButtonText,
            ]}
          >
            All
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[
            styles.filterButton,
            filter === 'incoming' && styles.activeFilterButton,
          ]}
          onPress={() => setFilter('incoming')}
        >
          <Text
            style={[
              styles.filterButtonText,
              filter === 'incoming' && styles.activeFilterButtonText,
            ]}
          >
            Incoming
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[
            styles.filterButton,
            filter === 'outgoing' && styles.activeFilterButton,
          ]}
          onPress={() => setFilter('outgoing')}
        >
          <Text
            style={[
              styles.filterButtonText,
              filter === 'outgoing' && styles.activeFilterButtonText,
            ]}
          >
            Outgoing
          </Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={getFilteredTransactions()}
        renderItem={({ item }) => (
          <TransactionItem
            transaction={item}
            onPress={handleTransactionPress}
          />
        )}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="document-text-outline" size={64} color="#d1d5db" />
            <Text style={styles.emptyText}>No transactions found</Text>
            <Text style={styles.emptySubtext}>
              {filter !== 'all'
                ? 'Try changing the filter or pull down to refresh'
                : 'Pull down to refresh'}
            </Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
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
  filterContainer: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  filterButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    marginRight: 8,
    backgroundColor: '#f3f4f6',
  },
  activeFilterButton: {
    backgroundColor: '#4f46e5',
  },
  filterButtonText: {
    color: '#6b7280',
    fontWeight: '500',
  },
  activeFilterButtonText: {
    color: '#ffffff',
  },
  listContainer: {
    padding: 16,
    paddingBottom: 24,
  },
  emptyContainer: {
    padding: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#6b7280',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#9ca3af',
    marginTop: 8,
    textAlign: 'center',
  },
});
EOL
fi

# Create blank app assets to prevent errors
section "Creating App Assets"
progress "Creating basic assets..."
mkdir -p ./assets

# Creating basic placeholder assets
progress "Creating placeholder icon.png..."
# Create a simple blue placeholder icon 1024x1024
cat > ./assets/icon.png << 'EOL'
iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+P+/HgAFPQJAGukX9wAAAABJRU5ErkJggg==
EOL

progress "Creating placeholder splash.png..."
# Create a simple blue placeholder splash 1242x2436
cat > ./assets/splash.png << 'EOL'
iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+P+/HgAFPQJAGukX9wAAAABJRU5ErkJggg==
EOL

progress "Creating placeholder adaptive-icon.png..."
cat > ./assets/adaptive-icon.png << 'EOL'
iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+P+/HgAFPQJAGukX9wAAAABJRU5ErkJggg==
EOL

progress "Creating placeholder favicon.png..."
cat > ./assets/favicon.png << 'EOL'
iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+P+/HgAFPQJAGukX9wAAAABJRU5ErkJggg==
EOL

progress "Downloading credit card assets..."
# Download actual card logo images using curl
curl -s -o ./assets/visa-logo.png https://raw.githubusercontent.com/kristoferjoseph/flexcomponents/master/examples/logos/visa.png || {
  echo "Failed to download Visa logo. Creating fallback colored rectangle."
  # Create a simple colored rectangle as fallback
  echo -e "\x89PNG\r\n\x1a\n\x00\x00\x00\rIHDR\x00\x00\x00d\x00\x00\x00(\x08\x06\x00\x00\x00\xbe\xc0\xd8g\x00\x00\x00\tpHYs\x00\x00\x0e\xc4\x00\x00\x0e\xc4\x01\x95+\x0e\x1b\x00\x00\x00zIDATx\x9c\xed\xd0\xb1\r\xc0 \x10\x04\xd1\xef\xaaT\xe9\xea\x1d0\x06\x98\"m\xc8\xdd\x89\xb6\xf0\x80e$Xd\xc9\x9a\xf7\x1d\xd2\x9e-\xab\xee'\x8a\"\"\xd5)@S\x80\xa6\x00M\x01\x9a\x02\xb4\xd5\xf7\xce\xec\xe3\xb3\x8d\x02\x143\x0eR\x14\xa0)@S\x80\xa6\x00M\x01\x9a\x02\xb4\xe5'\xa4\xfb\xa9\x7f'\x1d\x9a\x02\xb4'j\xae\xeb\xb4\xbc\x88\xa3\x1a\xb7\x19\x08\xae\xd6\x00\x00\x00\x00IEND\xaeB\x60\x82" > ./assets/visa-logo.png
}

curl -s -o ./assets/mastercard-logo.png https://raw.githubusercontent.com/kristoferjoseph/flexcomponents/master/examples/logos/mc.png || {
  echo "Failed to download Mastercard logo. Creating fallback colored rectangle."
  # Create a simple colored rectangle as fallback
  echo -e "\x89PNG\r\n\x1a\n\x00\x00\x00\rIHDR\x00\x00\x00d\x00\x00\x00(\x08\x06\x00\x00\x00\xbe\xc0\xd8g\x00\x00\x00\tpHYs\x00\x00\x0e\xc4\x00\x00\x0e\xc4\x01\x95+\x0e\x1b\x00\x00\x00zIDATx\x9c\xed\xd2\xb1\r\x80 \x10\x04\xc1\xbbs\nw\x9d\n\x04\xc1\x1a\xba\xe0\x84zl\xc9Vq\xef\x96\x01\xc0~\x86\xe0\x8e\x0e\xddo\xeay\x18\x11\x11\xf1\x9b\x02\xb4\'@{\x02\xb4\'@{\x02\xb4\xebw\xab\xee\x8d-X\xd6\x83wN\x80\xf6\x04h\x7f\xcc-\xb8\xe2\x03x,@{\x02\xb4'@{\x02\xb4'@{\x02\xb4\x03\x02\xb9\xbd\"\xef\xeb\x9cm\x16\x00\x00\x00\x00IEND\xaeB\x60\x82" > ./assets/mastercard-logo.png
}

curl -s -o ./assets/amex-logo.png https://raw.githubusercontent.com/kristoferjoseph/flexcomponents/master/examples/logos/amex.png || {
  echo "Failed to download Amex logo. Creating fallback colored rectangle."
  # Create a simple colored rectangle as fallback
  echo -e "\x89PNG\r\n\x1a\n\x00\x00\x00\rIHDR\x00\x00\x00d\x00\x00\x00(\x08\x06\x00\x00\x00\xbe\xc0\xd8g\x00\x00\x00\tpHYs\x00\x00\x0e\xc4\x00\x00\x0e\xc4\x01\x95+\x0e\x1b\x00\x00\x00zIDATx\x9c\xed\xd2\xb1\r\x80 \x10\x04\xc1\xbbs\nw\x9d\n\x04\xc1\x1a\xba\xe0\x84zl\xc9Vq\xef\x96\x01\xc0~\x86\xe0\x8e\x0e\xddo\xeay\x18\x11\x11\xf1\x9b\x02\xb4\'@{\x02\xb4\'@{\x02\xb4\xebw\xab\xee\x8d-X\xd6\x83wN\x80\xf6\x04h\x7f\xcc-\xb8\xe2\x03x,@{\x02\xb4'@{\x02\xb4'@{\x02\xb4\x03\x02\xb9\xbd\"\xef\xeb\x9cm\x16\x00\x00\x00\x00IEND\xaeB\x60\x82" > ./assets/amex-logo.png
}

# Alternative approach: Add instructions to manually copy image files
echo "NOTE: If you encounter issues with the credit card images, download these images manually:"
echo "Visa logo: https://raw.githubusercontent.com/kristoferjoseph/flexcomponents/master/examples/logos/visa.png"
echo "Mastercard logo: https://raw.githubusercontent.com/kristoferjoseph/flexcomponents/master/examples/logos/mc.png"
echo "Amex logo: https://raw.githubusercontent.com/kristoferjoseph/flexcomponents/master/examples/logos/amex.png"

# Update app.json to make it work without proper assets during development
progress "Updating app.json for development..."
cat > app.json << 'EOL'
{
  "expo": {
    "name": "PaySage Wallet",
    "slug": "paysage-wallet",
    "version": "1.0.0",
    "orientation": "portrait",
    "icon": "./assets/icon.png",
    "userInterfaceStyle": "light",
    "splash": {
      "image": "./assets/splash.png",
      "resizeMode": "contain",
      "backgroundColor": "#4F46E5"
    },
    "assetBundlePatterns": [
      "**/*"
    ],
    "ios": {
      "supportsTablet": true
    },
    "android": {
      "adaptiveIcon": {
        "foregroundImage": "./assets/adaptive-icon.png",
        "backgroundColor": "#ffffff"
      }
    },
    "web": {
      "favicon": "./assets/favicon.png"
    }
  }
}
EOL

section "Migration Complete!"
echo -e "${GREEN}Your new Expo SDK 53 project has been created at:${NC}"
echo -e "${YELLOW}$NEW_PROJECT_PATH${NC}"
echo ""
echo -e "${GREEN}To run the app:${NC}"
echo -e "${YELLOW}cd $NEW_PROJECT_PATH${NC}"
echo -e "${YELLOW}npm start${NC}"
echo ""
echo -e "${GREEN}What to do next:${NC}"
echo -e "1. Copy any additional screens or components from the old project"
echo -e "2. Test the app to make sure everything works"
echo -e "3. Update the API_URL in api/client.js to point to your actual backend"
echo ""