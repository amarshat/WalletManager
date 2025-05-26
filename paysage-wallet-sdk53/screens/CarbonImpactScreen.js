import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Switch
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';

export default function CarbonImpactScreen({ navigation }) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [carbonData, setCarbonData] = useState(null);
  const [trackingEnabled, setTrackingEnabled] = useState(true);
  const [offsetsEnabled, setOffsetsEnabled] = useState(false);
  const [carbonCategories, setCarbonCategories] = useState([]);

  useEffect(() => {
    fetchCarbonData();
    fetchCarbonSettings();
    fetchCarbonCategories();
  }, []);

  const fetchCarbonData = async () => {
    // In a real app, this would fetch from your API
    setTimeout(() => {
      setCarbonData({
        totalImpact: 128.5, // kg of CO2
        totalOffset: 75.0, // kg of CO2
        netImpact: 53.5, // kg of CO2
        monthlyAverage: 145.2, // kg of CO2
        impactByCategory: {
          'groceries': 35.2,
          'transportation': 48.7,
          'utilities': 22.4,
          'shopping': 15.8,
          'other': 6.4
        },
        recentImpacts: [
          {
            id: 1,
            date: '2025-05-18T15:30:00',
            category: 'transportation',
            amount: 8.5,
            source: 'Ride sharing'
          },
          {
            id: 2,
            date: '2025-05-16T12:45:00',
            category: 'groceries',
            amount: 3.2,
            source: 'Grocery purchase'
          },
          {
            id: 3,
            date: '2025-05-15T19:20:00',
            category: 'utilities',
            amount: 12.7,
            source: 'Energy bill'
          }
        ],
        recentOffsets: [
          {
            id: 1,
            date: '2025-05-10T09:15:00',
            amount: 50.0,
            project: 'Tree Planting Initiative'
          },
          {
            id: 2,
            date: '2025-04-25T14:30:00',
            amount: 25.0,
            project: 'Renewable Energy Fund'
          }
        ]
      });
      setLoading(false);
    }, 1000);
  };

  const fetchCarbonSettings = async () => {
    // In a real app, this would fetch from your API
    setTimeout(() => {
      setTrackingEnabled(true);
      setOffsetsEnabled(false);
    }, 800);
  };

  const fetchCarbonCategories = async () => {
    // In a real app, this would fetch from your API
    setTimeout(() => {
      setCarbonCategories([
        { id: 1, name: 'groceries', averageImpact: 0.3, icon: 'basket-outline' },
        { id: 2, name: 'transportation', averageImpact: 0.8, icon: 'car-outline' },
        { id: 3, name: 'utilities', averageImpact: 0.5, icon: 'flash-outline' },
        { id: 4, name: 'shopping', averageImpact: 0.4, icon: 'cart-outline' },
        { id: 5, name: 'other', averageImpact: 0.2, icon: 'ellipsis-horizontal-outline' }
      ]);
    }, 800);
  };

  const handleToggleTracking = async (value) => {
    setTrackingEnabled(value);
    // In a real app, this would update the setting on the server
    // Example: await updateCarbonSettings({ trackingEnabled: value });
  };

  const handleToggleOffsets = async (value) => {
    setOffsetsEnabled(value);
    // In a real app, this would update the setting on the server
    // Example: await updateCarbonSettings({ offsetsEnabled: value });
    
    if (value) {
      Alert.alert(
        'Automatic Carbon Offsets',
        'Your transactions will automatically contribute to carbon offset projects. You can adjust the percentage in settings.',
        [{ text: 'OK' }]
      );
    }
  };

  const handlePurchaseOffset = () => {
    // In a real app, navigate to purchase offset screen
    Alert.alert('Purchase Offset', 'This feature is coming soon!');
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getCategoryIcon = (category) => {
    const found = carbonCategories.find(cat => cat.name === category);
    return found ? found.icon : 'help-circle-outline';
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4f46e5" />
        <Text style={styles.loadingText}>Loading carbon impact data...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {/* Carbon Impact Overview */}
      <View style={styles.overviewCard}>
        <View style={styles.overviewHeader}>
          <Ionicons name="leaf" size={24} color="#10b981" />
          <Text style={styles.overviewTitle}>Carbon Impact Overview</Text>
        </View>
        
        <View style={styles.impactMetrics}>
          <View style={styles.metric}>
            <Text style={styles.metricValue}>{carbonData.totalImpact.toFixed(1)}</Text>
            <Text style={styles.metricLabel}>kg CO₂ total</Text>
          </View>
          
          <View style={styles.metric}>
            <Text style={styles.metricValue}>{carbonData.totalOffset.toFixed(1)}</Text>
            <Text style={styles.metricLabel}>kg CO₂ offset</Text>
          </View>
          
          <View style={styles.metric}>
            <Text style={[
              styles.metricValue,
              carbonData.netImpact > 0 ? styles.negativeImpact : styles.positiveImpact
            ]}>
              {carbonData.netImpact.toFixed(1)}
            </Text>
            <Text style={styles.metricLabel}>kg CO₂ net</Text>
          </View>
        </View>
        
        {/* Progress Bar */}
        <View style={styles.progressContainer}>
          <View style={styles.progressBackground}>
            <View 
              style={[
                styles.progressFill,
                { width: `${Math.min(100, (carbonData.totalOffset / carbonData.totalImpact) * 100)}%` }
              ]}
            />
          </View>
          <Text style={styles.progressText}>
            {Math.round((carbonData.totalOffset / carbonData.totalImpact) * 100)}% Offset
          </Text>
        </View>
      </View>

      {/* Settings */}
      <View style={styles.settingsCard}>
        <Text style={styles.settingsTitle}>Carbon Tracking</Text>
        
        <View style={styles.settingItem}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingLabel}>Track Carbon Impact</Text>
            <Text style={styles.settingDescription}>
              Calculate carbon impact for your transactions
            </Text>
          </View>
          <Switch
            value={trackingEnabled}
            onValueChange={handleToggleTracking}
            trackColor={{ false: '#d1d5db', true: '#10b981' }}
            thumbColor="#ffffff"
          />
        </View>
        
        <View style={styles.settingItem}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingLabel}>Automatic Offsets</Text>
            <Text style={styles.settingDescription}>
              Automatically offset carbon from transactions
            </Text>
          </View>
          <Switch
            value={offsetsEnabled}
            onValueChange={handleToggleOffsets}
            trackColor={{ false: '#d1d5db', true: '#10b981' }}
            thumbColor="#ffffff"
          />
        </View>
        
        <TouchableOpacity 
          style={styles.offsetButton}
          onPress={handlePurchaseOffset}
        >
          <Ionicons name="add-circle-outline" size={18} color="#ffffff" />
          <Text style={styles.offsetButtonText}>Purchase Carbon Offset</Text>
        </TouchableOpacity>
      </View>

      {/* Impact By Category */}
      <View style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>Impact By Category</Text>
        
        {Object.entries(carbonData.impactByCategory).map(([category, impact]) => (
          <View key={category} style={styles.categoryItem}>
            <View style={styles.categoryIcon}>
              <Ionicons name={getCategoryIcon(category)} size={18} color="#4f46e5" />
            </View>
            <View style={styles.categoryInfo}>
              <Text style={styles.categoryName}>
                {category.charAt(0).toUpperCase() + category.slice(1)}
              </Text>
              <View style={styles.categoryProgressContainer}>
                <View 
                  style={[
                    styles.categoryProgress,
                    { 
                      width: `${Math.min(100, (impact / carbonData.totalImpact) * 100)}%`,
                      backgroundColor: 
                        category === 'transportation' ? '#ef4444' :
                        category === 'groceries' ? '#10b981' :
                        category === 'utilities' ? '#f59e0b' :
                        category === 'shopping' ? '#8b5cf6' : '#6b7280'
                    }
                  ]}
                />
              </View>
            </View>
            <Text style={styles.categoryValue}>{impact.toFixed(1)} kg</Text>
          </View>
        ))}
      </View>

      {/* Recent Impacts */}
      <View style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>Recent Impacts</Text>
        
        {carbonData.recentImpacts.map(impact => (
          <View key={impact.id} style={styles.impactItem}>
            <View style={[
              styles.impactIcon,
              {
                backgroundColor: 
                  impact.category === 'transportation' ? 'rgba(239, 68, 68, 0.1)' :
                  impact.category === 'groceries' ? 'rgba(16, 185, 129, 0.1)' :
                  impact.category === 'utilities' ? 'rgba(245, 158, 11, 0.1)' :
                  impact.category === 'shopping' ? 'rgba(139, 92, 246, 0.1)' : 'rgba(107, 114, 128, 0.1)',
                  
                color: 
                  impact.category === 'transportation' ? '#ef4444' :
                  impact.category === 'groceries' ? '#10b981' :
                  impact.category === 'utilities' ? '#f59e0b' :
                  impact.category === 'shopping' ? '#8b5cf6' : '#6b7280'
              }
            ]}>
              <Ionicons 
                name={getCategoryIcon(impact.category)} 
                size={18}
                color={
                  impact.category === 'transportation' ? '#ef4444' :
                  impact.category === 'groceries' ? '#10b981' :
                  impact.category === 'utilities' ? '#f59e0b' :
                  impact.category === 'shopping' ? '#8b5cf6' : '#6b7280'
                }
              />
            </View>
            <View style={styles.impactInfo}>
              <Text style={styles.impactSource}>{impact.source}</Text>
              <Text style={styles.impactDate}>{formatDate(impact.date)}</Text>
            </View>
            <Text style={styles.impactAmount}>{impact.amount.toFixed(1)} kg CO₂</Text>
          </View>
        ))}
      </View>

      {/* Recent Offsets */}
      {carbonData.recentOffsets.length > 0 && (
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Recent Offsets</Text>
          
          {carbonData.recentOffsets.map(offset => (
            <View key={offset.id} style={styles.offsetItem}>
              <View style={styles.offsetIcon}>
                <Ionicons name="leaf" size={18} color="#10b981" />
              </View>
              <View style={styles.offsetInfo}>
                <Text style={styles.offsetProject}>{offset.project}</Text>
                <Text style={styles.offsetDate}>{formatDate(offset.date)}</Text>
              </View>
              <Text style={styles.offsetAmount}>{offset.amount.toFixed(1)} kg CO₂</Text>
            </View>
          ))}
        </View>
      )}

      {/* Tips */}
      <View style={styles.tipsCard}>
        <Text style={styles.tipsTitle}>Tips to Reduce Your Carbon Footprint</Text>
        
        <View style={styles.tipItem}>
          <View style={styles.tipIcon}>
            <Ionicons name="car-outline" size={18} color="#4f46e5" />
          </View>
          <View style={styles.tipContent}>
            <Text style={styles.tipText}>
              Use public transportation or carpool when possible to reduce transportation emissions.
            </Text>
          </View>
        </View>
        
        <View style={styles.tipItem}>
          <View style={styles.tipIcon}>
            <Ionicons name="basket-outline" size={18} color="#4f46e5" />
          </View>
          <View style={styles.tipContent}>
            <Text style={styles.tipText}>
              Buy local and seasonal produce to reduce the carbon footprint of your groceries.
            </Text>
          </View>
        </View>
        
        <View style={styles.tipItem}>
          <View style={styles.tipIcon}>
            <Ionicons name="flash-outline" size={18} color="#4f46e5" />
          </View>
          <View style={styles.tipContent}>
            <Text style={styles.tipText}>
              Reduce energy consumption by turning off lights and unplugging devices when not in use.
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>
          Carbon tracking is powered by the PaySage Sustainability Engine.
        </Text>
      </View>
    </ScrollView>
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
  overviewCard: {
    backgroundColor: '#ffffff',
    marginHorizontal: 16,
    marginTop: 16,
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  overviewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  overviewTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginLeft: 8,
  },
  impactMetrics: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  metric: {
    alignItems: 'center',
  },
  metricValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 4,
  },
  metricLabel: {
    fontSize: 12,
    color: '#6b7280',
  },
  negativeImpact: {
    color: '#ef4444',
  },
  positiveImpact: {
    color: '#10b981',
  },
  progressContainer: {
    marginTop: 8,
  },
  progressBackground: {
    height: 8,
    backgroundColor: '#e5e7eb',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#10b981',
    borderRadius: 4,
  },
  progressText: {
    marginTop: 8,
    fontSize: 12,
    color: '#6b7280',
    textAlign: 'right',
  },
  settingsCard: {
    backgroundColor: '#ffffff',
    marginHorizontal: 16,
    marginTop: 16,
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  settingsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 16,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  settingInfo: {
    flex: 1,
    marginRight: 16,
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#111827',
    marginBottom: 2,
  },
  settingDescription: {
    fontSize: 14,
    color: '#6b7280',
  },
  offsetButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#10b981',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginTop: 8,
  },
  offsetButtonText: {
    color: '#ffffff',
    fontWeight: '500',
    marginLeft: 8,
  },
  sectionCard: {
    backgroundColor: '#ffffff',
    marginHorizontal: 16,
    marginTop: 16,
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 16,
  },
  categoryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  categoryIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(79, 70, 229, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  categoryInfo: {
    flex: 1,
    marginRight: 8,
  },
  categoryName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#111827',
    marginBottom: 4,
  },
  categoryProgressContainer: {
    height: 6,
    backgroundColor: '#e5e7eb',
    borderRadius: 3,
    overflow: 'hidden',
  },
  categoryProgress: {
    height: '100%',
    borderRadius: 3,
  },
  categoryValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#111827',
  },
  impactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  impactIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  impactInfo: {
    flex: 1,
    marginRight: 8,
  },
  impactSource: {
    fontSize: 14,
    fontWeight: '500',
    color: '#111827',
    marginBottom: 2,
  },
  impactDate: {
    fontSize: 12,
    color: '#6b7280',
  },
  impactAmount: {
    fontSize: 14,
    fontWeight: '500',
    color: '#111827',
  },
  offsetItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  offsetIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  offsetInfo: {
    flex: 1,
    marginRight: 8,
  },
  offsetProject: {
    fontSize: 14,
    fontWeight: '500',
    color: '#111827',
    marginBottom: 2,
  },
  offsetDate: {
    fontSize: 12,
    color: '#6b7280',
  },
  offsetAmount: {
    fontSize: 14,
    fontWeight: '500',
    color: '#10b981',
  },
  tipsCard: {
    backgroundColor: '#ffffff',
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 24,
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  tipsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 16,
  },
  tipItem: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  tipIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(79, 70, 229, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  tipContent: {
    flex: 1,
  },
  tipText: {
    fontSize: 14,
    color: '#374151',
    lineHeight: 20,
  },
  footer: {
    alignItems: 'center',
    marginBottom: 30,
    paddingHorizontal: 16,
  },
  footerText: {
    fontSize: 12,
    color: '#9ca3af',
    textAlign: 'center',
  },
});