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