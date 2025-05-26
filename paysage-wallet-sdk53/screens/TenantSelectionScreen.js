import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Alert,
  ActivityIndicator,
  Image,
  TextInput,
  Modal,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { apiClient } from '../api/client';

const TenantSelectionScreen = ({ navigation }) => {
  const [tenants, setTenants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTenant, setSelectedTenant] = useState(null);
  const [customTenantId, setCustomTenantId] = useState('');
  const [showCustomModal, setShowCustomModal] = useState(false);
  const [brandSettings, setBrandSettings] = useState(null);

  useEffect(() => {
    loadTenants();
  }, []);

  const loadTenants = async () => {
    try {
      setLoading(true);
      const tenantsData = await apiClient.tenants.getPublicTenants();
      setTenants(tenantsData);
    } catch (error) {
      console.error('Error loading tenants:', error);
      Alert.alert('Error', 'Failed to load available organizations. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  const selectTenant = async (tenant) => {
    try {
      setSelectedTenant(tenant);
      
      // Load brand settings for the selected tenant
      const settings = await apiClient.tenants.getBrandSettings(tenant.id);
      setBrandSettings(settings);
      
      // Save selected tenant
      await AsyncStorage.setItem('selected_tenant', JSON.stringify(tenant));
      await AsyncStorage.setItem('brand_settings', JSON.stringify(settings));
      
      // Navigate to login
      navigation.navigate('Login', { tenant, brandSettings: settings });
    } catch (error) {
      console.error('Error selecting tenant:', error);
      Alert.alert('Error', 'Failed to load organization settings. Please try again.');
    }
  };

  const handleCustomTenant = async () => {
    if (!customTenantId.trim()) {
      Alert.alert('Error', 'Please enter a valid organization ID');
      return;
    }

    try {
      // Try to find the tenant by ID
      const tenant = tenants.find(t => t.tenantId === customTenantId.trim());
      if (tenant) {
        await selectTenant(tenant);
        setShowCustomModal(false);
        setCustomTenantId('');
      } else {
        Alert.alert('Error', 'Organization not found. Please check the ID and try again.');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to load organization. Please try again.');
    }
  };

  const renderTenantItem = ({ item }) => (
    <TouchableOpacity
      style={[
        styles.tenantCard,
        { borderColor: item.primaryColor || '#4F46E5' }
      ]}
      onPress={() => selectTenant(item)}
    >
      <View style={styles.tenantContent}>
        {item.logo && (
          <Image
            source={{ uri: item.logo }}
            style={styles.tenantLogo}
            resizeMode="contain"
          />
        )}
        <View style={styles.tenantInfo}>
          <Text style={styles.tenantName}>{item.name}</Text>
          <Text style={styles.tenantTagline}>{item.tagline}</Text>
          <Text style={styles.tenantId}>ID: {item.tenantId}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4F46E5" />
        <Text style={styles.loadingText}>Loading organizations...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Paysafe Embedded Wallet Platform</Text>
        <Text style={styles.subtitle}>Select your organization to continue</Text>
      </View>

      <FlatList
        data={tenants}
        renderItem={renderTenantItem}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.tenantList}
        showsVerticalScrollIndicator={false}
      />

      <TouchableOpacity
        style={styles.customButton}
        onPress={() => setShowCustomModal(true)}
      >
        <Text style={styles.customButtonText}>Enter Custom Organization ID</Text>
      </TouchableOpacity>

      {/* Custom Tenant Modal */}
      <Modal
        visible={showCustomModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowCustomModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Enter Organization ID</Text>
            
            <TextInput
              style={styles.textInput}
              placeholder="Organization ID"
              value={customTenantId}
              onChangeText={setCustomTenantId}
              autoCapitalize="none"
            />
            
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => {
                  setShowCustomModal(false);
                  setCustomTenantId('');
                }}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.modalButton, styles.confirmButton]}
                onPress={handleCustomTenant}
              >
                <Text style={styles.confirmButtonText}>Continue</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
    paddingHorizontal: 20,
    paddingTop: 60,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#64748b',
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1e293b',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#64748b',
    textAlign: 'center',
  },
  tenantList: {
    paddingBottom: 20,
  },
  tenantCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 2,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  tenantContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  tenantLogo: {
    width: 48,
    height: 48,
    marginRight: 16,
  },
  tenantInfo: {
    flex: 1,
  },
  tenantName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 4,
  },
  tenantTagline: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 4,
  },
  tenantId: {
    fontSize: 12,
    color: '#94a3b8',
  },
  customButton: {
    backgroundColor: '#e2e8f0',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    marginBottom: 32,
    alignItems: 'center',
  },
  customButtonText: {
    fontSize: 16,
    color: '#475569',
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 24,
    margin: 20,
    width: '80%',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 16,
    textAlign: 'center',
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    marginBottom: 20,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    marginHorizontal: 4,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#f1f5f9',
  },
  confirmButton: {
    backgroundColor: '#4F46E5',
  },
  cancelButtonText: {
    color: '#64748b',
    fontWeight: '600',
  },
  confirmButtonText: {
    color: '#ffffff',
    fontWeight: '600',
  },
});

export default TenantSelectionScreen;