// Create these files in your new project to fix the asset errors

// 1. Create a splash.png file in the assets folder
// You can use a simple image generator or copy an existing splash screen

// 2. Create the TransactionItem component
/*
Create a file at: components/TransactionItem.js with this content:

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function TransactionItem({ transaction, onPress }) {
  const formatCurrency = (amount, currency = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
    }).format(amount);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }).format(date);
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

  return (
    <TouchableOpacity 
      style={styles.container} 
      onPress={() => onPress && onPress(transaction)}
    >
      <View style={styles.iconContainer}>
        {getTransactionIcon(transaction.type)}
      </View>
      
      <View style={styles.details}>
        <Text style={styles.description}>{transaction.description}</Text>
        <Text style={styles.date}>{formatDate(transaction.date)}</Text>
      </View>
      
      <Text
        style={[
          styles.amount,
          { color: transaction.amount < 0 ? '#ef4444' : '#10b981' },
        ]}
      >
        {formatCurrency(transaction.amount, transaction.currency)}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 4,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  details: {
    flex: 1,
  },
  description: {
    fontSize: 16,
    color: '#1f2937',
    marginBottom: 4,
  },
  date: {
    fontSize: 14,
    color: '#6b7280',
  },
  amount: {
    fontSize: 16,
    fontWeight: '600',
  },
});
*/

// 3. Create a TransactionsScreen if it doesn't exist
/*
Create a file at: screens/TransactionsScreen.js with this content:

import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  FlatList,
  RefreshControl,
  ActivityIndicator,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import TransactionItem from '../components/TransactionItem';

export default function TransactionsScreen({ navigation }) {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState('all'); // all, incoming, outgoing

  // Fetch transactions
  const fetchTransactions = async () => {
    try {
      setLoading(true);
      
      // Mock data for demonstration
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
        { 
          id: 4, 
          type: 'deposit', 
          amount: 250, 
          currency: 'USD', 
          description: 'Freelance work',
          date: '2023-04-22T12:30:00Z'
        },
        { 
          id: 5, 
          type: 'withdrawal', 
          amount: -100, 
          currency: 'USD', 
          description: 'ATM withdrawal',
          date: '2023-04-21T16:20:00Z'
        },
        { 
          id: 6, 
          type: 'payment', 
          amount: -35.25, 
          currency: 'USD', 
          description: 'Restaurant bill',
          date: '2023-04-20T20:10:00Z'
        },
        { 
          id: 7, 
          type: 'transfer', 
          amount: -200, 
          currency: 'USD', 
          description: 'Rent payment',
          date: '2023-04-19T09:00:00Z'
        },
      ];
      
      // In a real app, fetch from API
      // const response = await apiClient.transactions.getAll();
      
      setTransactions(mockTransactions);
    } catch (error) {
      console.error('Error fetching transactions:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Load transactions on initial render
  useEffect(() => {
    fetchTransactions();
  }, []);

  // Handle pull-to-refresh
  const onRefresh = () => {
    setRefreshing(true);
    fetchTransactions();
  };

  // Filter transactions based on selected filter
  const getFilteredTransactions = () => {
    switch (filter) {
      case 'incoming':
        return transactions.filter(t => t.amount > 0);
      case 'outgoing':
        return transactions.filter(t => t.amount < 0);
      default:
        return transactions;
    }
  };

  // Handle transaction item press
  const handleTransactionPress = (transaction) => {
    // Navigate to transaction details or show in modal
    console.log('Transaction pressed:', transaction);
  };

  if (loading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4f46e5" />
        <Text style={styles.loadingText}>Loading transactions...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Filter buttons */}
      <View style={styles.filterContainer}>
        <TouchableOpacity
          style={[
            styles.filterButton,
            filter === 'all' && styles.activeFilterButton,
          ]}
          onPress={() => setFilter('all')}
        >
          <Text
            style={[
              styles.filterButtonText,
              filter === 'all' && styles.activeFilterButtonText,
            ]}
          >
            All
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[
            styles.filterButton,
            filter === 'incoming' && styles.activeFilterButton,
          ]}
          onPress={() => setFilter('incoming')}
        >
          <Text
            style={[
              styles.filterButtonText,
              filter === 'incoming' && styles.activeFilterButtonText,
            ]}
          >
            Incoming
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[
            styles.filterButton,
            filter === 'outgoing' && styles.activeFilterButton,
          ]}
          onPress={() => setFilter('outgoing')}
        >
          <Text
            style={[
              styles.filterButtonText,
              filter === 'outgoing' && styles.activeFilterButtonText,
            ]}
          >
            Outgoing
          </Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={getFilteredTransactions()}
        renderItem={({ item }) => (
          <TransactionItem
            transaction={item}
            onPress={handleTransactionPress}
          />
        )}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="document-text-outline" size={64} color="#d1d5db" />
            <Text style={styles.emptyText}>No transactions found</Text>
            <Text style={styles.emptySubtext}>
              {filter !== 'all'
                ? 'Try changing the filter or pull down to refresh'
                : 'Pull down to refresh'}
            </Text>
          </View>
        }
      />
    </SafeAreaView>
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
  filterContainer: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  filterButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    marginRight: 8,
    backgroundColor: '#f3f4f6',
  },
  activeFilterButton: {
    backgroundColor: '#4f46e5',
  },
  filterButtonText: {
    color: '#6b7280',
    fontWeight: '500',
  },
  activeFilterButtonText: {
    color: '#ffffff',
  },
  listContainer: {
    padding: 16,
    paddingBottom: 24,
  },
  emptyContainer: {
    padding: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#6b7280',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#9ca3af',
    marginTop: 8,
    textAlign: 'center',
  },
});
*/

// 4. Create a blank logo and splash image for your app
// For a quick solution, you can create these in the assets folder:
// - icon.png (1024x1024px)
// - splash.png (1242x2436px)
// - adaptive-icon.png (1024x1024px with safe area)
// - favicon.png (32x32px)

// 5. Update the app.json to make splash and icon optional during development
/*
You can also temporarily modify the app.json to remove the requirement for these assets:

{
  "expo": {
    "name": "PaySage Wallet",
    "slug": "paysage-wallet",
    "version": "1.0.0",
    "orientation": "portrait",
    "userInterfaceStyle": "light",
    "assetBundlePatterns": [
      "**/*"
    ],
    "ios": {
      "supportsTablet": true
    },
    "android": {
      "adaptiveIcon": {
        "backgroundColor": "#ffffff"
      }
    }
  }
}
*/