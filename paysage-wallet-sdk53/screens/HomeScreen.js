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
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { apiClient } from '../api/client';
import { LinearGradient } from 'expo-linear-gradient';

export default function HomeScreen({ navigation }) {
  const { user } = useAuth();
  const [balance, setBalance] = useState(null);
  const [accounts, setAccounts] = useState([]);
  const [recentTransactions, setRecentTransactions] = useState([]);
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
      const mockBalance = {
        totalBalance: 1250.75,
        currency: 'USD'
      };
      
      const mockAccounts = [
        { id: 1, type: 'checking', balance: 950.25, currency: 'USD' },
        { id: 2, type: 'savings', balance: 300.50, currency: 'USD' },
      ];
      
      const mockTransactions = [
        { 
          id: 1, 
          type: 'deposit', 
          amount: 500, 
          currency: 'USD', 
          description: 'Salary payment',
          date: '2023-04-25T14:30:00Z'
        },
        { 
          id: 2, 
          type: 'transfer', 
          amount: -75.50, 
          currency: 'USD', 
          description: 'Transfer to John',
          date: '2023-04-24T09:15:00Z'
        },
        { 
          id: 3, 
          type: 'payment', 
          amount: -45.99, 
          currency: 'USD', 
          description: 'Amazon purchase',
          date: '2023-04-23T18:45:00Z'
        },
      ];
      
      // In a real app, fetch data from your API:
      // const balanceResponse = await apiClient.wallet.getBalance();
      // const accountsResponse = await apiClient.wallet.getAccounts();
      // const transactionsResponse = await apiClient.transactions.getAll(5);
      
      setBalance(mockBalance);
      setAccounts(mockAccounts);
      setRecentTransactions(mockTransactions);
      
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

  // Get transaction icon based on type
  const getTransactionIcon = (type) => {
    switch (type) {
      case 'deposit':
        return <Ionicons name="arrow-down-circle" size={24} color="#10b981" />;
      case 'withdrawal':
        return <Ionicons name="arrow-up-circle" size={24} color="#ef4444" />;
      case 'transfer':
        return <Ionicons name="swap-horizontal" size={24} color="#6366f1" />;
      case 'payment':
        return <Ionicons name="cart" size={24} color="#f59e0b" />;
      default:
        return <Ionicons name="ellipsis-horizontal" size={24} color="#6b7280" />;
    }
  };

  // Format date to relative time (e.g., "2 days ago")
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMs = now - date;
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
    
    if (diffInDays === 0) {
      return 'Today';
    } else if (diffInDays === 1) {
      return 'Yesterday';
    } else if (diffInDays < 7) {
      return `${diffInDays} days ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4f46e5" />
        <Text style={styles.loadingText}>Loading your dashboard...</Text>
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
      {/* Welcome Section */}
      <View style={styles.welcomeSection}>
        <Text style={styles.welcomeText}>
          Welcome back, {user?.username || 'User'}
        </Text>
        <Text style={styles.dateText}>{new Date().toDateString()}</Text>
      </View>

      {/* Balance Card */}
      <LinearGradient
        colors={['#4f46e5', '#6366f1', '#818cf8']}
        style={styles.balanceCard}
      >
        <View style={styles.balanceHeader}>
          <Text style={styles.balanceLabel}>Total Balance</Text>
          <TouchableOpacity
            onPress={() => navigation.navigate('Wallet')}
            style={styles.viewDetailsButton}
          >
            <Text style={styles.viewDetailsText}>View Details</Text>
          </TouchableOpacity>
        </View>
        <Text style={styles.balanceAmount}>
          {balance ? formatCurrency(balance.totalBalance, balance.currency) : '$0.00'}
        </Text>
        <View style={styles.actionButtonsContainer}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => navigation.navigate('AddMoney')}
          >
            <Ionicons name="add-circle" size={22} color="#ffffff" />
            <Text style={styles.actionButtonText}>Add</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => navigation.navigate('SendMoney')}
          >
            <Ionicons name="send" size={22} color="#ffffff" />
            <Text style={styles.actionButtonText}>Send</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => navigation.navigate('Cards')}
          >
            <Ionicons name="card" size={22} color="#ffffff" />
            <Text style={styles.actionButtonText}>Cards</Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>

      {/* Accounts Section */}
      <View style={styles.sectionContainer}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Your Accounts</Text>
        </View>
        
        {accounts.length > 0 ? (
          accounts.map((account) => (
            <View key={account.id} style={styles.accountItem}>
              <View style={styles.accountInfo}>
                <View style={styles.accountIconContainer}>
                  <Ionicons
                    name={account.type === 'savings' ? 'wallet' : 'card'}
                    size={20}
                    color="#4f46e5"
                  />
                </View>
                <Text style={styles.accountType}>
                  {account.type.charAt(0).toUpperCase() + account.type.slice(1)}
                </Text>
              </View>
              <Text style={styles.accountBalance}>
                {formatCurrency(account.balance, account.currency)}
              </Text>
            </View>
          ))
        ) : (
          <Text style={styles.emptyText}>No accounts found</Text>
        )}
      </View>

      {/* Recent Transactions */}
      <View style={[styles.sectionContainer, { marginBottom: 20 }]}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recent Transactions</Text>
          <TouchableOpacity
            onPress={() => navigation.navigate('Transactions')}
          >
            <Text style={styles.viewAllText}>View All</Text>
          </TouchableOpacity>
        </View>
        
        {recentTransactions.length > 0 ? (
          recentTransactions.map((transaction) => (
            <View key={transaction.id} style={styles.transactionItem}>
              <View style={styles.transactionIconContainer}>
                {getTransactionIcon(transaction.type)}
              </View>
              <View style={styles.transactionDetails}>
                <Text style={styles.transactionDescription}>
                  {transaction.description}
                </Text>
                <Text style={styles.transactionDate}>
                  {formatDate(transaction.date)}
                </Text>
              </View>
              <Text
                style={[
                  styles.transactionAmount,
                  { color: transaction.amount < 0 ? '#ef4444' : '#10b981' },
                ]}
              >
                {formatCurrency(transaction.amount, transaction.currency)}
              </Text>
            </View>
          ))
        ) : (
          <Text style={styles.emptyText}>No recent transactions</Text>
        )}
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
  welcomeSection: {
    padding: 16,
    paddingTop: 20,
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  dateText: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 4,
  },
  balanceCard: {
    borderRadius: 16,
    padding: 20,
    marginHorizontal: 16,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  balanceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  balanceLabel: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  viewDetailsButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  viewDetailsText: {
    fontSize: 12,
    color: '#ffffff',
  },
  balanceAmount: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#ffffff',
    marginVertical: 16,
  },
  actionButtonsContainer: {
    flexDirection: 'row',
    marginTop: 8,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginRight: 12,
  },
  actionButtonText: {
    color: '#ffffff',
    marginLeft: 6,
    fontWeight: '500',
  },
  sectionContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
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
  viewAllText: {
    fontSize: 14,
    color: '#4f46e5',
  },
  accountItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  accountInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  accountIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  accountType: {
    fontSize: 16,
    color: '#1f2937',
  },
  accountBalance: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
  },
  transactionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  transactionIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  transactionDetails: {
    flex: 1,
  },
  transactionDescription: {
    fontSize: 16,
    color: '#1f2937',
  },
  transactionDate: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 2,
  },
  transactionAmount: {
    fontSize: 16,
    fontWeight: '600',
  },
  emptyText: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    paddingVertical: 16,
  },
});