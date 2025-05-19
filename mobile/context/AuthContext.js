import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

// API URL will need to be updated with the actual server URL when deploying
const API_URL = 'https://paysage-wallet.example.com/api';

// Create the auth context
const AuthContext = createContext();

// Custom hook to use the auth context
export const useAuth = () => {
  return useContext(AuthContext);
};

// Auth provider component
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Check if user is logged in on app load
  useEffect(() => {
    // Load user from AsyncStorage
    const loadUser = async () => {
      try {
        const userString = await AsyncStorage.getItem('user');
        if (userString) {
          const userData = JSON.parse(userString);
          setUser(userData);
          
          // Verify token is still valid
          await verifyToken(userData.token);
        }
      } catch (error) {
        console.error('Error loading user:', error);
        // Clear potentially corrupted storage
        await AsyncStorage.removeItem('user');
      } finally {
        setIsLoading(false);
      }
    };

    loadUser();
  }, []);

  // Verify the token is still valid
  const verifyToken = async (token) => {
    try {
      const response = await fetch(`${API_URL}/user`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        // Token is invalid, log out
        logout();
      }
    } catch (error) {
      console.error('Token verification error:', error);
      // Don't log out on network errors to allow offline usage
    }
  };

  // Login function
  const login = async (username, password) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_URL}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Login failed');
      }

      // Store user data in state
      setUser(data);

      // Store in AsyncStorage
      await AsyncStorage.setItem('user', JSON.stringify(data));
      
      return data;
    } catch (error) {
      setError(error.message);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Register function
  const register = async (userData) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_URL}/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Registration failed');
      }

      // Automatically log in the user
      setUser(data);
      await AsyncStorage.setItem('user', JSON.stringify(data));
      
      return data;
    } catch (error) {
      setError(error.message);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Logout function
  const logout = async () => {
    try {
      // Call logout API if needed
      if (user?.token) {
        await fetch(`${API_URL}/logout`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${user.token}`,
            'Content-Type': 'application/json',
          },
        });
      }
    } catch (error) {
      console.error('Logout API error:', error);
    } finally {
      // Always clear local storage and state
      setUser(null);
      await AsyncStorage.removeItem('user');
    }
  };

  // Update user profile
  const updateProfile = async (profileData) => {
    if (!user) throw new Error('Not authenticated');
    
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_URL}/profile`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${user.token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(profileData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Update failed');
      }

      // Update user state with new data
      const updatedUser = { ...user, ...data };
      setUser(updatedUser);
      
      // Update AsyncStorage
      await AsyncStorage.setItem('user', JSON.stringify(updatedUser));
      
      return data;
    } catch (error) {
      setError(error.message);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Provide the auth context value
  const value = {
    user,
    isLoading,
    error,
    login,
    register,
    logout,
    updateProfile
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};