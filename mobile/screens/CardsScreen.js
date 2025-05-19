import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  FlatList,
  Image,
  Alert,
  ActivityIndicator
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';

export default function CardsScreen({ navigation }) {
  const { user } = useAuth();
  const [cards, setCards] = useState([]);
  const [prepaidCards, setPrepaidCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('debit'); // 'debit' or 'prepaid'

  useEffect(() => {
    fetchCards();
  }, []);

  const fetchCards = async () => {
    setLoading(true);
    try {
      // In a real app, this would fetch from your API
      // Simulating API call for demo purposes
      setTimeout(() => {
        setCards([
          { 
            id: 1, 
            type: 'debit',
            last4: '4567',
            expiryMonth: 9,
            expiryYear: 26,
            cardholderName: user?.fullName || user?.username,
            brand: 'mastercard',
            status: 'active',
            color: '#4f46e5'
          },
          { 
            id: 2, 
            type: 'debit',
            last4: '8901',
            expiryMonth: 3,
            expiryYear: 27,
            cardholderName: user?.fullName || user?.username,
            brand: 'visa',
            status: 'active',
            color: '#10b981'
          }
        ]);
        
        setPrepaidCards([
          {
            id: 1,
            type: 'prepaid',
            last4: '2345',
            expiryMonth: 12,
            expiryYear: 25,
            cardholderName: user?.fullName || user?.username,
            brand: 'mastercard',
            status: 'active',
            balance: 125.50,
            currencyCode: 'USD',
            color: '#f59e0b'
          },
          {
            id: 2,
            type: 'prepaid',
            last4: '6789',
            expiryMonth: 6,
            expiryYear: 26,
            cardholderName: user?.fullName || user?.username,
            brand: 'visa',
            status: 'inactive',
            balance: 0,
            currencyCode: 'USD',
            color: '#8b5cf6'
          }
        ]);
        
        setLoading(false);
      }, 1000);
    } catch (error) {
      Alert.alert('Error', 'Failed to load cards');
      setLoading(false);
    }
  };

  const handleAddCard = () => {
    // In a real app, navigate to add card screen
    Alert.alert('Add Card', 'This feature is coming soon!');
  };

  const handleCardPress = (card) => {
    // In a real app, navigate to card details screen
    Alert.alert('Card Details', `Card ending in ${card.last4}`);
  };

  const formatCurrency = (amount, code) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: code,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  const getBrandLogo = (brand) => {
    if (brand === 'visa') {
      return require('../assets/visa-logo.png'); // fallback to an icon if image not available
    } else if (brand === 'mastercard') {
      return require('../assets/mastercard-logo.png'); // fallback to an icon if image not available
    }
    
    return null;
  };

  const renderCardItem = ({ item }) => {
    const isActiveCard = item.status === 'active';
    
    return (
      <TouchableOpacity 
        style={[
          styles.cardContainer, 
          { backgroundColor: item.color }
        ]}
        onPress={() => handleCardPress(item)}
        activeOpacity={0.9}
      >
        <View style={styles.cardHeader}>
          <View style={styles.chipIcon}>
            <Ionicons name="card" size={24} color="#fff" />
          </View>
          <View style={styles.brandLogo}>
            {/* Use actual brand logos in a real app */}
            <Text style={styles.brandText}>{item.brand.toUpperCase()}</Text>
          </View>
        </View>
        
        <View style={styles.cardNumber}>
          <Text style={styles.cardNumberText}>•••• •••• •••• {item.last4}</Text>
        </View>
        
        <View style={styles.cardFooter}>
          <View>
            <Text style={styles.cardLabel}>CARDHOLDER NAME</Text>
            <Text style={styles.cardValue}>{item.cardholderName}</Text>
          </View>
          
          <View>
            <Text style={styles.cardLabel}>EXPIRES</Text>
            <Text style={styles.cardValue}>
              {item.expiryMonth.toString().padStart(2, '0')}/{item.expiryYear}
            </Text>
          </View>
        </View>
        
        {item.type === 'prepaid' && (
          <View style={styles.balanceContainer}>
            <Text style={styles.balanceLabel}>BALANCE</Text>
            <Text style={styles.balanceValue}>
              {formatCurrency(item.balance, item.currencyCode)}
            </Text>
          </View>
        )}
        
        {!isActiveCard && (
          <View style={styles.inactiveOverlay}>
            <View style={styles.inactiveTag}>
              <Text style={styles.inactiveText}>INACTIVE</Text>
            </View>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="card-outline" size={48} color="#d1d5db" />
      <Text style={styles.emptyText}>
        {activeTab === 'debit' 
          ? 'No debit cards found' 
          : 'No prepaid cards found'}
      </Text>
      <TouchableOpacity 
        style={styles.addCardButton} 
        onPress={handleAddCard}
      >
        <Text style={styles.addCardButtonText}>
          + Add {activeTab === 'debit' ? 'Debit' : 'Prepaid'} Card
        </Text>
      </TouchableOpacity>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4f46e5" />
        <Text style={styles.loadingText}>Loading cards...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Tab Navigation */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[
            styles.tab,
            activeTab === 'debit' && styles.activeTab
          ]}
          onPress={() => handleTabChange('debit')}
        >
          <Text 
            style={[
              styles.tabText,
              activeTab === 'debit' && styles.activeTabText
            ]}
          >
            Debit Cards
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[
            styles.tab,
            activeTab === 'prepaid' && styles.activeTab
          ]}
          onPress={() => handleTabChange('prepaid')}
        >
          <Text 
            style={[
              styles.tabText,
              activeTab === 'prepaid' && styles.activeTabText
            ]}
          >
            Prepaid Cards
          </Text>
        </TouchableOpacity>
      </View>

      {/* Card List */}
      <FlatList
        data={activeTab === 'debit' ? cards : prepaidCards}
        renderItem={renderCardItem}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.cardList}
        ListEmptyComponent={renderEmptyState}
        showsVerticalScrollIndicator={false}
      />

      {/* Add Card Button */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity 
          style={styles.floatingButton} 
          onPress={handleAddCard}
        >
          <Ionicons name="add" size={24} color="#ffffff" />
          <Text style={styles.floatingButtonText}>
            Add {activeTab === 'debit' ? 'Debit' : 'Prepaid'} Card
          </Text>
        </TouchableOpacity>
      </View>
    </View>
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
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    margin: 16,
    borderRadius: 8,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeTab: {
    backgroundColor: '#4f46e5',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6b7280',
  },
  activeTabText: {
    color: '#ffffff',
  },
  cardList: {
    paddingHorizontal: 16,
    paddingBottom: 80,
  },
  cardContainer: {
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  chipIcon: {
    width: 40,
    height: 30,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  brandLogo: {
    padding: 4,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  brandText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  cardNumber: {
    marginBottom: 24,
  },
  cardNumberText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '500',
    letterSpacing: 2,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  cardLabel: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 10,
    marginBottom: 4,
  },
  cardValue: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '500',
  },
  balanceContainer: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.2)',
  },
  balanceLabel: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 10,
    marginBottom: 4,
  },
  balanceValue: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  inactiveOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  inactiveTag: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
  },
  inactiveText: {
    color: '#ef4444',
    fontWeight: 'bold',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    marginVertical: 16,
  },
  emptyText: {
    fontSize: 16,
    color: '#6b7280',
    marginTop: 16,
    marginBottom: 24,
  },
  addCardButton: {
    backgroundColor: '#4f46e5',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  addCardButtonText: {
    color: '#ffffff',
    fontWeight: '500',
    fontSize: 16,
  },
  buttonContainer: {
    position: 'absolute',
    bottom: 24,
    left: 16,
    right: 16,
  },
  floatingButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#4f46e5',
    borderRadius: 8,
    paddingVertical: 16,
    shadowColor: '#4f46e5',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  floatingButtonText: {
    color: '#ffffff',
    fontWeight: '600',
    fontSize: 16,
    marginLeft: 8,
  },
});