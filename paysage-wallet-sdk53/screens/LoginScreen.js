import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '../context/AuthContext';
import { LinearGradient } from 'expo-linear-gradient';

export default function LoginScreen({ route, navigation }) {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const [tenant, setTenant] = useState(null);
  const [brandSettings, setBrandSettings] = useState(null);
  const { login, register, isLoading } = useAuth();

  useEffect(() => {
    loadTenantSettings();
  }, []);

  const loadTenantSettings = async () => {
    try {
      const tenantData = await AsyncStorage.getItem('selected_tenant');
      const brandData = await AsyncStorage.getItem('brand_settings');
      
      if (tenantData) {
        setTenant(JSON.parse(tenantData));
      }
      
      if (brandData) {
        setBrandSettings(JSON.parse(brandData));
      }
    } catch (error) {
      console.error('Error loading tenant settings:', error);
    }
  };

  const changeTenant = () => {
    navigation.navigate('TenantSelection');
  };

  const handleSubmit = async () => {
    if (!username || !password) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    try {
      if (isLogin) {
        await login(username, password);
      } else {
        if (!email || !fullName) {
          Alert.alert('Error', 'Please fill in all required fields');
          return;
        }
        await register({
          username,
          password,
          email,
          fullName,
        });
      }
    } catch (error) {
      Alert.alert(
        'Authentication Error',
        error.message || 'Something went wrong. Please try again.'
      );
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.logoContainer}>
          {tenant && brandSettings ? (
            <>
              {brandSettings.logo && (
                <Image
                  source={{ uri: brandSettings.logo }}
                  style={styles.tenantLogo}
                  resizeMode="contain"
                />
              )}
              <Text style={[styles.logoText, { color: brandSettings.primaryColor || '#4f46e5' }]}>
                {brandSettings.name}
              </Text>
              <Text style={styles.tagline}>{brandSettings.tagline}</Text>
              <TouchableOpacity style={styles.changeTenantButton} onPress={changeTenant}>
                <Text style={styles.changeTenantText}>Change Organization</Text>
              </TouchableOpacity>
            </>
          ) : (
            <>
              <Text style={styles.logoText}>Paysafe Embedded Wallet Platform</Text>
              <Text style={styles.tagline}>Your Digital Wallet Solution</Text>
              <TouchableOpacity style={styles.changeTenantButton} onPress={changeTenant}>
                <Text style={styles.changeTenantText}>Select Organization</Text>
              </TouchableOpacity>
            </>
          )}
        </View>

        <View style={styles.formContainer}>
          <Text style={styles.title}>
            {isLogin ? 'Sign In' : 'Create Account'}
          </Text>

          {!isLogin && (
            <>
              <Text style={styles.inputLabel}>Full Name</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter your full name"
                value={fullName}
                onChangeText={setFullName}
                autoCapitalize="words"
              />

              <Text style={styles.inputLabel}>Email</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter your email"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </>
          )}

          <Text style={styles.inputLabel}>Username</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter your username"
            value={username}
            onChangeText={setUsername}
            autoCapitalize="none"
          />

          <Text style={styles.inputLabel}>Password</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter your password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />

          <TouchableOpacity
            style={styles.forgotPasswordButton}
            onPress={() => Alert.alert('Coming Soon', 'This feature is coming soon!')}
          >
            <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.submitButton}
            onPress={handleSubmit}
            disabled={isLoading}
          >
            <LinearGradient
              colors={['#6366f1', '#4f46e5', '#4338ca']}
              style={styles.buttonGradient}
            >
              {isLoading ? (
                <ActivityIndicator color="#ffffff" />
              ) : (
                <Text style={styles.submitButtonText}>
                  {isLogin ? 'Sign In' : 'Create Account'}
                </Text>
              )}
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.switchButton}
            onPress={() => setIsLogin(!isLogin)}
          >
            <Text style={styles.switchButtonText}>
              {isLogin
                ? "Don't have an account? Sign Up"
                : 'Already have an account? Sign In'}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  tenantLogo: {
    width: 80,
    height: 80,
    marginBottom: 16,
  },
  logoText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#4f46e5',
    marginBottom: 8,
    textAlign: 'center',
  },
  tagline: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 12,
  },
  changeTenantButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#f3f4f6',
    borderRadius: 6,
    marginTop: 8,
  },
  changeTenantText: {
    fontSize: 14,
    color: '#6b7280',
    fontWeight: '500',
  },
  formContainer: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 24,
    textAlign: 'center',
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#4b5563',
    marginBottom: 6,
  },
  input: {
    backgroundColor: '#f3f4f6',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    fontSize: 16,
  },
  forgotPasswordButton: {
    alignSelf: 'flex-end',
    marginBottom: 24,
  },
  forgotPasswordText: {
    color: '#4f46e5',
    fontSize: 14,
  },
  submitButton: {
    marginBottom: 16,
    borderRadius: 8,
    overflow: 'hidden',
  },
  buttonGradient: {
    paddingVertical: 16,
    alignItems: 'center',
    borderRadius: 8,
  },
  submitButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  switchButton: {
    alignItems: 'center',
  },
  switchButtonText: {
    color: '#4f46e5',
    fontSize: 14,
  },
});