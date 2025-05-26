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
        // Attempt to get the user data
        const userData = await apiClient.auth.getCurrentUser();
        setUser(userData);
      } catch (error) {
        console.log('Not authenticated');
        setUser(null);
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
      
      const newUser = await apiClient.auth.register(userData);
      setUser(newUser);
      return newUser;
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
      await apiClient.auth.logout();
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