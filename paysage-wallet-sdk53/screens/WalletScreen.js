import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Alert,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../context/AuthContext';
import { apiClient } from '../api/client';

const screenWidth = Dimensions.get('window').width;

export default function WalletScreen({ navigation }) {
  const { user } = useAuth();
  const [accounts, setAccounts] = useState([]);
  const [cards, setCards] = useState([]);
  const [prepaidCards, setPrepaidCards] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);

  // Format currency function
  const formatCurrency = (amount, currency = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
    }).format(amount);
  };

  // Fetch wallet data
  const fetchWalletData = async () => {
    try {
      setLoading(true);
      
      // For demonstration purposes, using mock data
      // In a real app, you would fetch from your API
      const mockAccounts = [
        { id: 1, type: 'checking', balance: 950.25, currency: 'USD', accountNumber: '****4321' },
        { id: 2, type: 'savings', balance: 300.50, currency: 'USD', accountNumber: '****8765' },
      ];
      
      const mockCards = [
        { 
          id: 1, 
          type: 'visa', 
          name: 'PaySage Visa',
          maskedNumber: '****9876',
          expiryMonth: 9,
          expiryYear: 25,
          isDefault: true,
        },
        { 
          id: 2, 
          type: 'mastercard', 
          name: 'PaySage Credit',
          maskedNumber: '****5432',
          expiryMonth: 3,
          expiryYear: 26,
          isDefault: false,
        },
      ];
      
      const mockPrepaidCards = [
        { 
          id: 1, 
          name: 'Shopping Card',
          balance: 150,
          currency: 'USD',
          maskedNumber: '****1234',
          expiryMonth: 12,
          expiryYear: 24,
          status: 'active'
        },
        { 
          id: 2, 
          name: 'Travel Card',
          balance: 85.75,
          currency: 'USD',
          maskedNumber: '****5678',
          expiryMonth: 8,
          expiryYear: 25,
          status: 'active'
        },
      ];
      
      // In a real app, fetch data from your API:
      // const accountsResponse = await apiClient.wallet.getAccounts();
      // const cardsResponse = await apiClient.cards.getAll();
      // const prepaidCardsResponse = await apiClient.prepaidCards.getAll();
      
      setAccounts(mockAccounts);
      setCards(mockCards);
      setPrepaidCards(mockPrepaidCards);
      
    } catch (error) {
      Alert.alert('Error', 'Failed to load wallet data. Please try again.');
      console.error('Error fetching wallet data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Load data on initial render
  useEffect(() => {
    fetchWalletData();
  }, []);

  // Handle pull-to-refresh
  const onRefresh = () => {
    setRefreshing(true);
    fetchWalletData();
  };

  // Get total balance from all accounts
  const getTotalBalance = () => {
    return accounts.reduce((total, account) => total + account.balance, 0);
  };

  // Get card icon based on type
  const getCardIcon = (type) => {
    switch (type.toLowerCase()) {
      case 'visa':
        return <Ionicons name="card" size={24} color="#1a1f71" />;
      case 'mastercard':
        return <Ionicons name="card" size={24} color="#eb001b" />;
      case 'amex':
        return <Ionicons name="card" size={24} color="#006fcf" />;
      default:
        return <Ionicons name="card-outline" size={24} color="#6b7280" />;
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4f46e5" />
        <Text style={styles.loadingText}>Loading your wallet...</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {/* Balance Summary */}
      <LinearGradient
        colors={['#4f46e5', '#6366f1', '#818cf8']}
        style={styles.balanceSummary}
      >
        <Text style={styles.balanceLabel}>Total Balance</Text>
        <Text style={styles.balanceAmount}>
          {formatCurrency(getTotalBalance(), 'USD')}
        </Text>
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => navigation.navigate('AddMoney')}
          >
            <Ionicons name="add-circle" size={20} color="#ffffff" />
            <Text style={styles.actionButtonText}>Add Money</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => navigation.navigate('SendMoney')}
          >
            <Ionicons name="paper-plane" size={20} color="#ffffff" />
            <Text style={styles.actionButtonText}>Send Money</Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>

      {/* Accounts Section */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Your Accounts</Text>
          <TouchableOpacity>
            <Text style={styles.linkText}>Manage</Text>
          </TouchableOpacity>
        </View>

        {accounts.map((account) => (
          <View key={account.id} style={styles.accountCard}>
            <View style={styles.accountHeader}>
              <View style={styles.accountIconContainer}>
                <Ionicons
                  name={account.type === 'savings' ? 'wallet' : 'card'}
                  size={24}
                  color="#4f46e5"
                />
              </View>
              <View style={styles.accountInfo}>
                <Text style={styles.accountType}>
                  {account.type.charAt(0).toUpperCase() + account.type.slice(1)} Account
                </Text>
                <Text style={styles.accountNumber}>{account.accountNumber}</Text>
              </View>
            </View>
            <Text style={styles.accountBalance}>
              {formatCurrency(account.balance, account.currency)}
            </Text>
            <View style={styles.accountActions}>
              <TouchableOpacity style={styles.accountAction}>
                <Ionicons name="arrow-up-circle" size={18} color="#4f46e5" />
                <Text style={styles.accountActionText}>Transfer</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.accountAction}>
                <Ionicons name="document-text" size={18} color="#4f46e5" />
                <Text style={styles.accountActionText}>Statement</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.accountAction}>
                <Ionicons name="ellipsis-horizontal" size={18} color="#4f46e5" />
                <Text style={styles.accountActionText}>More</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}

        <TouchableOpacity style={styles.addButton}>
          <Ionicons name="add-circle" size={20} color="#4f46e5" />
          <Text style={styles.addButtonText}>Add New Account</Text>
        </TouchableOpacity>
      </View>

      {/* Cards Section */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Your Cards</Text>
          <TouchableOpacity
            onPress={() => navigation.navigate('Cards')}
          >
            <Text style={styles.linkText}>View All</Text>
          </TouchableOpacity>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.cardsContainer}
        >
          {cards.map((card) => (
            <TouchableOpacity
              key={card.id}
              style={styles.cardItem}
              onPress={() => navigation.navigate('Cards')}
            >
              <View style={styles.cardHeader}>
                {getCardIcon(card.type)}
                {card.isDefault && (
                  <View style={styles.defaultBadge}>
                    <Text style={styles.defaultText}>Default</Text>
                  </View>
                )}
              </View>
              <Text style={styles.cardName}>{card.name}</Text>
              <Text style={styles.cardNumber}>{card.maskedNumber}</Text>
              <Text style={styles.cardExpiry}>
                Expires {card.expiryMonth}/{card.expiryYear}
              </Text>
            </TouchableOpacity>
          ))}

          <TouchableOpacity
            style={styles.addCardButton}
            onPress={() => navigation.navigate('Cards')}
          >
            <View style={styles.addCardIcon}>
              <Ionicons name="add" size={24} color="#4f46e5" />
            </View>
            <Text style={styles.addCardText}>Add New Card</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>

      {/* Prepaid Cards Section */}
      <View style={[styles.section, { marginBottom: 24 }]}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Prepaid Cards</Text>
          <TouchableOpacity>
            <Text style={styles.linkText}>View All</Text>
          </TouchableOpacity>
        </View>

        {prepaidCards.map((card) => (
          <View key={card.id} style={styles.prepaidCard}>
            <View style={styles.prepaidCardHeader}>
              <View style={styles.prepaidCardInfo}>
                <Text style={styles.prepaidCardName}>{card.name}</Text>
                <Text style={styles.prepaidCardNumber}>{card.maskedNumber}</Text>
              </View>
              <View style={styles.statusBadge}>
                <Text style={styles.statusText}>{card.status}</Text>
              </View>
            </View>
            <View style={styles.prepaidCardBalance}>
              <Text style={styles.prepaidCardLabel}>Available Balance</Text>
              <Text style={styles.prepaidCardAmount}>
                {formatCurrency(card.balance, card.currency)}
              </Text>
            </View>
            <View style={styles.prepaidCardActions}>
              <TouchableOpacity style={styles.prepaidCardAction}>
                <Ionicons name="add-circle" size={18} color="#4f46e5" />
                <Text style={styles.prepaidCardActionText}>Top Up</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.prepaidCardAction}>
                <Ionicons name="sync" size={18} color="#4f46e5" />
                <Text style={styles.prepaidCardActionText}>Transfer</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.prepaidCardAction}>
                <Ionicons name="ellipsis-horizontal" size={18} color="#4f46e5" />
                <Text style={styles.prepaidCardActionText}>Details</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}

        <TouchableOpacity style={styles.addButton}>
          <Ionicons name="add-circle" size={20} color="#4f46e5" />
          <Text style={styles.addButtonText}>Get New Prepaid Card</Text>
        </TouchableOpacity>
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
  balanceSummary: {
    padding: 24,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  balanceLabel: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 8,
  },
  balanceAmount: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 20,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 50,
    flex: 0.48,
    justifyContent: 'center',
  },
  actionButtonText: {
    color: '#ffffff',
    marginLeft: 8,
    fontWeight: '500',
  },
  section: {
    padding: 16,
    marginTop: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  linkText: {
    color: '#4f46e5',
    fontSize: 14,
  },
  accountCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  accountHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  accountIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  accountInfo: {
    flex: 1,
  },
  accountType: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
  },
  accountNumber: {
    fontSize: 14,
    color: '#6b7280',
  },
  accountBalance: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 16,
  },
  accountActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
    paddingTop: 12,
  },
  accountAction: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 6,
    flex: 1,
  },
  accountActionText: {
    fontSize: 14,
    color: '#4f46e5',
    marginLeft: 4,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 50,
    paddingVertical: 12,
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  addButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#4f46e5',
    marginLeft: 8,
  },
  cardsContainer: {
    paddingBottom: 8,
    paddingTop: 4,
  },
  cardItem: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    width: screenWidth * 0.7,
    marginRight: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  defaultBadge: {
    backgroundColor: '#10b981',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  defaultText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '500',
  },
  cardName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 6,
  },
  cardNumber: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 12,
  },
  cardExpiry: {
    fontSize: 14,
    color: '#6b7280',
  },
  addCardButton: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    width: screenWidth * 0.4,
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderStyle: 'dashed',
  },
  addCardIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  addCardText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#4f46e5',
    textAlign: 'center',
  },
  prepaidCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  prepaidCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  prepaidCardInfo: {
    flex: 1,
  },
  prepaidCardName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 4,
  },
  prepaidCardNumber: {
    fontSize: 14,
    color: '#6b7280',
  },
  statusBadge: {
    backgroundColor: '#10b981',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  statusText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '500',
    textTransform: 'capitalize',
  },
  prepaidCardBalance: {
    marginBottom: 16,
  },
  prepaidCardLabel: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 4,
  },
  prepaidCardAmount: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  prepaidCardActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
    paddingTop: 12,
  },
  prepaidCardAction: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 6,
    flex: 1,
  },
  prepaidCardActionText: {
    fontSize: 14,
    color: '#4f46e5',
    marginLeft: 4,
  },
});