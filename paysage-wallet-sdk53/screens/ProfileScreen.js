import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Image,
  ScrollView,
  Alert,
  Switch,
  ActivityIndicator
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';

export default function ProfileScreen({ navigation }) {
  const { user, logout, updateProfile } = useAuth();
  const [loading, setLoading] = useState(false);
  
  // Settings state
  const [notifications, setNotifications] = useState(true);
  const [biometricAuth, setBiometricAuth] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [privacyMode, setPrivacyMode] = useState(false);
  
  const handleLogout = async () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        {
          text: 'Cancel',
          style: 'cancel'
        },
        {
          text: 'Logout',
          onPress: async () => {
            setLoading(true);
            try {
              await logout();
            } catch (error) {
              Alert.alert('Error', 'Failed to logout. Please try again.');
            } finally {
              setLoading(false);
            }
          },
          style: 'destructive'
        }
      ]
    );
  };

  const handleEditProfile = () => {
    // In a real app, navigate to edit profile screen
    Alert.alert('Edit Profile', 'This feature is coming soon!');
  };

  const handleUpdateSetting = async (setting, value) => {
    // In a real app, this would update the setting on the server
    // For demo purposes, we're just updating the local state
    try {
      switch (setting) {
        case 'notifications':
          setNotifications(value);
          break;
        case 'biometricAuth':
          setBiometricAuth(value);
          break;
        case 'darkMode':
          setDarkMode(value);
          break;
        case 'privacyMode':
          setPrivacyMode(value);
          break;
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to update setting. Please try again.');
    }
  };

  const renderSettingItem = (icon, title, description, value, onValueChange) => (
    <View style={styles.settingItem}>
      <View style={styles.settingIcon}>
        <Ionicons name={icon} size={22} color="#4f46e5" />
      </View>
      <View style={styles.settingContent}>
        <Text style={styles.settingTitle}>{title}</Text>
        <Text style={styles.settingDescription}>{description}</Text>
      </View>
      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{ false: '#d1d5db', true: '#818cf8' }}
        thumbColor={value ? '#4f46e5' : '#f4f3f4'}
      />
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4f46e5" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      {/* Profile Header */}
      <View style={styles.profileHeader}>
        <View style={styles.avatarContainer}>
          <Text style={styles.avatarText}>
            {user?.fullName ? user.fullName.charAt(0).toUpperCase() : user?.username.charAt(0).toUpperCase()}
          </Text>
        </View>
        <Text style={styles.userName}>{user?.fullName || user?.username}</Text>
        <Text style={styles.userEmail}>{user?.email || 'No email provided'}</Text>
        
        <TouchableOpacity style={styles.editButton} onPress={handleEditProfile}>
          <Text style={styles.editButtonText}>Edit Profile</Text>
        </TouchableOpacity>
      </View>

      {/* Account Information */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Account Information</Text>
        
        <View style={styles.infoItem}>
          <View style={styles.infoIconContainer}>
            <Ionicons name="person-outline" size={20} color="#4f46e5" />
          </View>
          <View style={styles.infoContent}>
            <Text style={styles.infoLabel}>Username</Text>
            <Text style={styles.infoValue}>{user?.username}</Text>
          </View>
        </View>
        
        <View style={styles.infoItem}>
          <View style={styles.infoIconContainer}>
            <Ionicons name="calendar-outline" size={20} color="#4f46e5" />
          </View>
          <View style={styles.infoContent}>
            <Text style={styles.infoLabel}>Member Since</Text>
            <Text style={styles.infoValue}>May 2025</Text>
          </View>
        </View>
        
        <View style={styles.infoItem}>
          <View style={styles.infoIconContainer}>
            <Ionicons name="shield-checkmark-outline" size={20} color="#4f46e5" />
          </View>
          <View style={styles.infoContent}>
            <Text style={styles.infoLabel}>Verification Status</Text>
            <View style={styles.verificationStatus}>
              <Text style={styles.verificationText}>Verified</Text>
            </View>
          </View>
        </View>
      </View>

      {/* Settings */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Settings</Text>
        
        {renderSettingItem(
          'notifications-outline',
          'Push Notifications',
          'Receive alerts for transactions and updates',
          notifications,
          (value) => handleUpdateSetting('notifications', value)
        )}
        
        {renderSettingItem(
          'finger-print-outline',
          'Biometric Authentication',
          'Enable fingerprint or face ID for login',
          biometricAuth,
          (value) => handleUpdateSetting('biometricAuth', value)
        )}
        
        {renderSettingItem(
          'moon-outline',
          'Dark Mode',
          'Switch to dark color theme',
          darkMode,
          (value) => handleUpdateSetting('darkMode', value)
        )}
        
        {renderSettingItem(
          'eye-off-outline',
          'Privacy Mode',
          'Hide balance and transaction amounts',
          privacyMode,
          (value) => handleUpdateSetting('privacyMode', value)
        )}
      </View>

      {/* Support & Security */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Support & Security</Text>
        
        <TouchableOpacity style={styles.menuItem} onPress={() => {
          // In a real app, navigate to help center
          Alert.alert('Help Center', 'This feature is coming soon!');
        }}>
          <View style={styles.menuIconContainer}>
            <Ionicons name="help-circle-outline" size={20} color="#4f46e5" />
          </View>
          <View style={styles.menuContent}>
            <Text style={styles.menuTitle}>Help Center</Text>
            <Text style={styles.menuDescription}>Get answers to your questions</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.menuItem} onPress={() => navigation.navigate('Settings')}>
          <View style={styles.menuIconContainer}>
            <Ionicons name="settings-outline" size={20} color="#4f46e5" />
          </View>
          <View style={styles.menuContent}>
            <Text style={styles.menuTitle}>App Settings</Text>
            <Text style={styles.menuDescription}>Configure deployment URL and organization</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.menuItem} onPress={() => {
          // In a real app, navigate to security settings
          Alert.alert('Security Settings', 'This feature is coming soon!');
        }}>
          <View style={styles.menuIconContainer}>
            <Ionicons name="lock-closed-outline" size={20} color="#4f46e5" />
          </View>
          <View style={styles.menuContent}>
            <Text style={styles.menuTitle}>Security Settings</Text>
            <Text style={styles.menuDescription}>Manage your account security</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.menuItem} onPress={() => {
          // In a real app, navigate to privacy policy
          Alert.alert('Privacy Policy', 'This feature is coming soon!');
        }}>
          <View style={styles.menuIconContainer}>
            <Ionicons name="document-text-outline" size={20} color="#4f46e5" />
          </View>
          <View style={styles.menuContent}>
            <Text style={styles.menuTitle}>Privacy Policy</Text>
            <Text style={styles.menuDescription}>Learn how we handle your data</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
        </TouchableOpacity>
      </View>

      {/* Logout Button */}
      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Ionicons name="log-out-outline" size={20} color="#ef4444" />
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>

      {/* App Info */}
      <View style={styles.appInfo}>
        <Text style={styles.appVersion}>PaySage Wallet v1.0.0</Text>
        <Text style={styles.appCopyright}>© 2025 PaySage. All rights reserved.</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  contentContainer: {
    paddingBottom: 30,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
  },
  profileHeader: {
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#ffffff',
  },
  avatarContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#4f46e5',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatarText: {
    color: '#ffffff',
    fontSize: 32,
    fontWeight: 'bold',
  },
  userName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 16,
  },
  editButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f3f4f6',
  },
  editButtonText: {
    color: '#4f46e5',
    fontWeight: '500',
  },
  section: {
    backgroundColor: '#ffffff',
    marginTop: 16,
    paddingVertical: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  infoIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(79, 70, 229, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 16,
    color: '#111827',
    fontWeight: '500',
  },
  verificationStatus: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  verificationText: {
    fontSize: 16,
    color: '#10b981',
    fontWeight: '500',
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  settingIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(79, 70, 229, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  settingContent: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    color: '#111827',
    fontWeight: '500',
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 14,
    color: '#6b7280',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  menuIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(79, 70, 229, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  menuContent: {
    flex: 1,
  },
  menuTitle: {
    fontSize: 16,
    color: '#111827',
    fontWeight: '500',
    marginBottom: 4,
  },
  menuDescription: {
    fontSize: 14,
    color: '#6b7280',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
    marginHorizontal: 16,
    padding: 12,
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderRadius: 8,
  },
  logoutText: {
    marginLeft: 8,
    fontSize: 16,
    fontWeight: '500',
    color: '#ef4444',
  },
  appInfo: {
    alignItems: 'center',
    marginTop: 20,
  },
  appVersion: {
    fontSize: 14,
    color: '#6b7280',
  },
  appCopyright: {
    fontSize: 12,
    color: '#9ca3af',
    marginTop: 4,
  },
});