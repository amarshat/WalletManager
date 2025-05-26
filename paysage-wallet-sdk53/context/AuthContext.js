import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { apiClient } from '../api/client';

// Create the auth context with a default value
const AuthContext = createContext({
  user: null,
  isLoading: true,
  error: null,
  login: async () => {},
  register: async () => {},
  logout: async () => {},
  updateProfile: async () => {},
});

// Provider component that wraps the app and provides auth context
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Check if user is logged in on app start
  useEffect(() => {
    const checkLoginStatus = async () => {
      try {
        const token = await AsyncStorage.getItem('auth_token');
        if (!token) {
          setUser(null);
          return;
        }
        
        // Attempt to get the user data
        const userData = await apiClient.auth.getCurrentUser();
        setUser(userData);
      } catch (error) {
        console.log('Not authenticated:', error.message);
        setUser(null);
        // Clear invalid token
        await AsyncStorage.removeItem('auth_token');
      } finally {
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
      
      const userData = await apiClient.auth.login({ username, password });
      setUser(userData);
      return userData;
    } catch (error) {
      const errorMessage = error.message || 'Failed to login';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // Register function
  const register = async (userData) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const newUser = await apiClient.auth.register(userData);
      setUser(newUser);
      return newUser;
    } catch (error) {
      const errorMessage = error.message || 'Failed to register';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // Logout function
  const logout = async () => {
    try {
      setIsLoading(true);
      await apiClient.auth.logout();
      setUser(null);
      await AsyncStorage.removeItem('auth_token');
    } catch (error) {
      console.error('Logout error:', error);
      // Still clear local state even if server logout fails
      setUser(null);
      await AsyncStorage.removeItem('auth_token');
    } finally {
      setIsLoading(false);
    }
  };

  // Update profile function
  const updateProfile = async (profileData) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const updatedUser = await apiClient.auth.updateProfile(profileData);
      setUser(updatedUser);
      return updatedUser;
    } catch (error) {
      const errorMessage = error.message || 'Failed to update profile';
      setError(errorMessage);
      throw new Error(errorMessage);
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
    logout,
    updateProfile
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