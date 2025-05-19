import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';

export default function WalletScreen({ navigation }) {
  const { user } = useAuth();
  const [accounts, setAccounts] = useState([]);
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchWalletData();
  }, []);

  const fetchWalletData = async () => {
    setLoading(true);
    try {
      // In a real app, this would fetch from your API
      // Simulating API call for demo purposes
      setTimeout(() => {
        setAccounts([
          { id: 1, balance: 1250.75, currencyCode: 'USD', primary: true },
          { id: 2, balance: 150.00, currencyCode: 'EUR', primary: false }
        ]);
        
        setCards([
          { 
            id: 1, 
            type: 'debit',
            last4: '4567',
            expiryMonth: 9,
            expiryYear: 26,
            brand: 'mastercard',
            status: 'active'
          },
          { 
            id: 2, 
            type: 'prepaid',
            last4: '8901',
            expiryMonth: 3,
            expiryYear: 27,
            brand: 'visa',
            status: 'active'
          }
        ]);
        
        setLoading(false);
      }, 1000);
    } catch (error) {
      Alert.alert('Error', 'Failed to load wallet data');
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchWalletData();
    setRefreshing(false);
  };

  // Format currency based on code
  const formatCurrency = (amount, code) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: code,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  };

  const handleAddMoney = () => {
    navigation.navigate('AddMoney');
  };

  const handleSendMoney = () => {
    navigation.navigate('SendMoney');
  };

  const handleAddAccount = () => {
    // In a real app, this would navigate to add account screen
    Alert.alert('Add Account', 'This feature is coming soon!');
  };

  if (loading && !refreshing && accounts.length === 0) {
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
      {/* Action Buttons */}
      <View style={styles.actionButtonsContainer}>
        <TouchableOpacity style={styles.actionButton} onPress={handleAddMoney}>
          <View style={styles.actionButtonIcon}>
            <Ionicons name="add-outline" size={24} color="#ffffff" />
          </View>
          <Text style={styles.actionButtonText}>Add Money</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.actionButton} onPress={handleSendMoney}>
          <View style={styles.actionButtonIcon}>
            <Ionicons name="send-outline" size={24} color="#ffffff" />
          </View>
          <Text style={styles.actionButtonText}>Send Money</Text>
        </TouchableOpacity>
      </View>

      {/* Accounts Section */}
      <View style={styles.sectionContainer}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Your Accounts</Text>
          <TouchableOpacity onPress={handleAddAccount}>
            <Text style={styles.actionText}>+ Add Account</Text>
          </TouchableOpacity>
        </View>

        {accounts.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>No accounts found</Text>
            <TouchableOpacity
              style={styles.emptyStateButton}
              onPress={handleAddAccount}
            >
              <Text style={styles.emptyStateButtonText}>Add an Account</Text>
            </TouchableOpacity>
          </View>
        ) : (
          accounts.map((account) => (
            <TouchableOpacity
              key={account.id}
              style={styles.accountCard}
              onPress={() => {
                /* Handle account press */
              }}
            >
              <View style={styles.accountDetails}>
                <View style={styles.accountNameContainer}>
                  <Text style={styles.accountName}>
                    {account.currencyCode} Account
                  </Text>
                  {account.primary && (
                    <View style={styles.primaryBadge}>
                      <Text style={styles.primaryBadgeText}>Primary</Text>
                    </View>
                  )}
                </View>
                <Text style={styles.accountBalance}>
                  {formatCurrency(account.balance, account.currencyCode)}
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
            </TouchableOpacity>
          ))
        )}
      </View>

      {/* Cards Section */}
      <View style={styles.sectionContainer}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Your Cards</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Cards')}>
            <Text style={styles.actionText}>View All</Text>
          </TouchableOpacity>
        </View>

        {cards.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>No cards found</Text>
            <TouchableOpacity
              style={styles.emptyStateButton}
              onPress={() => navigation.navigate('Cards')}
            >
              <Text style={styles.emptyStateButtonText}>Add a Card</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.cardsContainer}>
            {cards.map((card) => (
              <TouchableOpacity
                key={card.id}
                style={styles.cardItem}
                onPress={() => navigation.navigate('Cards')}
              >
                <View style={styles.cardIcon}>
                  <Ionicons
                    name={card.type === 'debit' ? 'card-outline' : 'gift-outline'}
                    size={24}
                    color="#4f46e5"
                  />
                </View>
                <View style={styles.cardDetails}>
                  <Text style={styles.cardType}>
                    {card.type === 'debit' ? 'Debit Card' : 'Prepaid Card'}
                  </Text>
                  <Text style={styles.cardNumber}>
                    {card.brand.toUpperCase()} •••• {card.last4}
                  </Text>
                </View>
                <View style={styles.cardStatus}>
                  {card.status === 'active' ? (
                    <View style={styles.activeStatus}>
                      <Text style={styles.activeStatusText}>Active</Text>
                    </View>
                  ) : (
                    <View style={styles.inactiveStatus}>
                      <Text style={styles.inactiveStatusText}>Inactive</Text>
                    </View>
                  )}
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>

      {/* Quick Actions */}
      <View style={styles.quickActionsContainer}>
        <Text style={styles.quickActionsTitle}>Quick Actions</Text>
        
        <View style={styles.quickActionsList}>
          <TouchableOpacity style={styles.quickActionItem} onPress={handleAddMoney}>
            <Ionicons name="add-circle-outline" size={20} color="#4f46e5" />
            <Text style={styles.quickActionText}>Add Money</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.quickActionItem} onPress={handleSendMoney}>
            <Ionicons name="send-outline" size={20} color="#4f46e5" />
            <Text style={styles.quickActionText}>Send Money</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.quickActionItem} 
            onPress={() => navigation.navigate('Transactions')}
          >
            <Ionicons name="list-outline" size={20} color="#4f46e5" />
            <Text style={styles.quickActionText}>Transactions</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.quickActionItem} 
            onPress={() => navigation.navigate('Cards')}
          >
            <Ionicons name="card-outline" size={20} color="#4f46e5" />
            <Text style={styles.quickActionText}>Cards</Text>
          </TouchableOpacity>
        </View>
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
  actionButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 16,
    backgroundColor: '#ffffff',
    marginBottom: 16,
  },
  actionButton: {
    alignItems: 'center',
  },
  actionButtonIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#4f46e5',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  actionButtonText: {
    fontSize: 14,
    color: '#4f46e5',
    fontWeight: '500',
  },
  sectionContainer: {
    backgroundColor: '#ffffff',
    paddingHorizontal: 16,
    paddingVertical: 16,
    marginBottom: 16,
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
    color: '#111827',
  },
  actionText: {
    fontSize: 14,
    color: '#4f46e5',
    fontWeight: '500',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
    backgroundColor: '#f9fafb',
    borderRadius: 8,
  },
  emptyStateText: {
    fontSize: 16,
    color: '#6b7280',
    marginBottom: 16,
  },
  emptyStateButton: {
    backgroundColor: '#4f46e5',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  emptyStateButtonText: {
    color: '#ffffff',
    fontWeight: '500',
  },
  accountCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
  },
  accountDetails: {
    flex: 1,
  },
  accountNameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  accountName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#111827',
  },
  primaryBadge: {
    backgroundColor: '#4f46e5',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    marginLeft: 8,
  },
  primaryBadgeText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '500',
  },
  accountBalance: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
  },
  cardsContainer: {
    marginTop: 8,
  },
  cardItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#f9fafb',
    borderRadius: 8,
    marginBottom: 12,
  },
  cardIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(79, 70, 229, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  cardDetails: {
    flex: 1,
  },
  cardType: {
    fontSize: 16,
    fontWeight: '500',
    color: '#111827',
    marginBottom: 4,
  },
  cardNumber: {
    fontSize: 14,
    color: '#6b7280',
  },
  cardStatus: {
    marginLeft: 12,
  },
  activeStatus: {
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  activeStatusText: {
    color: '#10b981',
    fontSize: 12,
    fontWeight: '500',
  },
  inactiveStatus: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  inactiveStatusText: {
    color: '#ef4444',
    fontSize: 12,
    fontWeight: '500',
  },
  quickActionsContainer: {
    backgroundColor: '#ffffff',
    paddingHorizontal: 16,
    paddingVertical: 16,
    marginBottom: 32,
  },
  quickActionsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 16,
  },
  quickActionsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  quickActionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginRight: 8,
    marginBottom: 8,
  },
  quickActionText: {
    fontSize: 14,
    color: '#4b5563',
    marginLeft: 6,
  },
});