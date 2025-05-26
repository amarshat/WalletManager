import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
  ScrollView,
  Switch,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { apiClient } from '../api/client';

const SettingsScreen = ({ navigation }) => {
  const [apiUrl, setApiUrl] = useState('');
  const [originalApiUrl, setOriginalApiUrl] = useState('');
  const [selectedTenant, setSelectedTenant] = useState(null);
  const [isTestingConnection, setIsTestingConnection] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const currentApiUrl = await apiClient.getApiUrl();
      const tenantData = await AsyncStorage.getItem('selected_tenant');
      
      setApiUrl(currentApiUrl);
      setOriginalApiUrl(currentApiUrl);
      
      if (tenantData) {
        setSelectedTenant(JSON.parse(tenantData));
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  };

  const testConnection = async () => {
    if (!apiUrl.trim()) {
      Alert.alert('Error', 'Please enter a valid API URL');
      return;
    }

    setIsTestingConnection(true);
    
    try {
      // Temporarily set the URL to test it
      await apiClient.setApiUrl(apiUrl.trim());
      
      // Try to fetch public tenants to test connection
      const tenants = await apiClient.tenants.getPublicTenants();
      
      Alert.alert(
        'Connection Successful',
        `Connected successfully! Found ${tenants.length} organization(s).`,
        [
          {
            text: 'OK',
            onPress: () => {
              setOriginalApiUrl(apiUrl.trim());
            }
          }
        ]
      );
    } catch (error) {
      console.error('Connection test failed:', error);
      
      // Restore original URL on failure
      await apiClient.setApiUrl(originalApiUrl);
      setApiUrl(originalApiUrl);
      
      Alert.alert(
        'Connection Failed',
        'Could not connect to the server. Please check the URL and try again.',
        [{ text: 'OK' }]
      );
    } finally {
      setIsTestingConnection(false);
    }
  };

  const saveSettings = async () => {
    try {
      await apiClient.setApiUrl(apiUrl.trim());
      setOriginalApiUrl(apiUrl.trim());
      Alert.alert('Success', 'Settings saved successfully!');
    } catch (error) {
      console.error('Error saving settings:', error);
      Alert.alert('Error', 'Failed to save settings. Please try again.');
    }
  };

  const resetToDefault = () => {
    Alert.alert(
      'Reset Settings',
      'This will reset the API URL to default (localhost). Continue?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: () => {
            setApiUrl('http://localhost:5000/api');
          }
        }
      ]
    );
  };

  const changeTenant = async () => {
    try {
      // Clear current tenant selection
      await AsyncStorage.removeItem('selected_tenant');
      await AsyncStorage.removeItem('brand_settings');
      
      // Navigate back to tenant selection
      navigation.reset({
        index: 0,
        routes: [{ name: 'TenantSelection' }],
      });
    } catch (error) {
      console.error('Error changing tenant:', error);
      Alert.alert('Error', 'Failed to change organization. Please try again.');
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Settings</Text>
        <Text style={styles.subtitle}>Configure your wallet app settings</Text>
      </View>

      {/* API Configuration Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Server Configuration</Text>
        <Text style={styles.sectionDescription}>
          Configure the API server URL for your wallet backend
        </Text>
        
        <Text style={styles.label}>API Base URL</Text>
        <TextInput
          style={styles.textInput}
          value={apiUrl}
          onChangeText={setApiUrl}
          placeholder="https://your-deployment.replit.app/api"
          autoCapitalize="none"
          autoCorrect={false}
          keyboardType="url"
        />
        
        <View style={styles.buttonRow}>
          <TouchableOpacity
            style={[styles.button, styles.testButton]}
            onPress={testConnection}
            disabled={isTestingConnection}
          >
            <Text style={styles.testButtonText}>
              {isTestingConnection ? 'Testing...' : 'Test Connection'}
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.button, styles.saveButton]}
            onPress={saveSettings}
          >
            <Text style={styles.saveButtonText}>Save</Text>
          </TouchableOpacity>
        </View>
        
        <TouchableOpacity
          style={[styles.button, styles.resetButton]}
          onPress={resetToDefault}
        >
          <Text style={styles.resetButtonText}>Reset to Default</Text>
        </TouchableOpacity>
      </View>

      {/* Organization Section */}
      {selectedTenant && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Current Organization</Text>
          <View style={styles.tenantInfo}>
            <Text style={styles.tenantName}>{selectedTenant.name}</Text>
            <Text style={styles.tenantId}>ID: {selectedTenant.tenantId}</Text>
            <Text style={styles.tenantTagline}>{selectedTenant.tagline}</Text>
          </View>
          
          <TouchableOpacity
            style={[styles.button, styles.changeButton]}
            onPress={changeTenant}
          >
            <Text style={styles.changeButtonText}>Change Organization</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Help Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Help</Text>
        <Text style={styles.helpText}>
          • Use your Replit deployment URL + "/api" for the API base URL{'\n'}
          • Example: https://your-app-name.username.repl.co/api{'\n'}
          • Test the connection before saving to ensure it works{'\n'}
          • Contact your administrator if you need help finding the correct URL
        </Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#64748b',
  },
  section: {
    backgroundColor: '#ffffff',
    marginHorizontal: 20,
    marginTop: 20,
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 8,
  },
  sectionDescription: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    marginBottom: 16,
    backgroundColor: '#ffffff',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  button: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 8,
  },
  testButton: {
    backgroundColor: '#f1f5f9',
    borderWidth: 1,
    borderColor: '#d1d5db',
    flex: 1,
    marginRight: 8,
  },
  saveButton: {
    backgroundColor: '#4F46E5',
    flex: 1,
    marginLeft: 8,
  },
  resetButton: {
    backgroundColor: '#fee2e2',
    borderWidth: 1,
    borderColor: '#fca5a5',
  },
  changeButton: {
    backgroundColor: '#f59e0b',
  },
  testButtonText: {
    color: '#374151',
    fontWeight: '600',
  },
  saveButtonText: {
    color: '#ffffff',
    fontWeight: '600',
  },
  resetButtonText: {
    color: '#dc2626',
    fontWeight: '600',
  },
  changeButtonText: {
    color: '#ffffff',
    fontWeight: '600',
  },
  tenantInfo: {
    backgroundColor: '#f8fafc',
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
  },
  tenantName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 4,
  },
  tenantId: {
    fontSize: 12,
    color: '#64748b',
    marginBottom: 4,
  },
  tenantTagline: {
    fontSize: 14,
    color: '#475569',
  },
  helpText: {
    fontSize: 14,
    color: '#64748b',
    lineHeight: 20,
  },
});

export default SettingsScreen;