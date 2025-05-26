import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  TextInput,
  Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import TransactionItem from '../components/TransactionItem';

export default function TransactionsScreen({ navigation }) {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState([]);
  const [filteredTransactions, setFilteredTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all');

  useEffect(() => {
    fetchTransactions();
  }, []);

  useEffect(() => {
    // Apply filters when transactions, search query or filter type changes
    if (transactions.length > 0) {
      let filtered = [...transactions];
      
      // Apply search
      if (searchQuery.trim() !== '') {
        filtered = filtered.filter(transaction => {
          const searchLower = searchQuery.toLowerCase();
          
          // Search in description and transaction parties (sender/recipient)
          return (
            (transaction.description && 
              transaction.description.toLowerCase().includes(searchLower)) ||
            (transaction.sender && 
              transaction.sender.toLowerCase().includes(searchLower)) ||
            (transaction.recipient && 
              transaction.recipient.toLowerCase().includes(searchLower)) ||
            (transaction.source && 
              transaction.source.toLowerCase().includes(searchLower)) ||
            (transaction.destination && 
              transaction.destination.toLowerCase().includes(searchLower))
          );
        });
      }
      
      // Apply type filter
      if (filterType !== 'all') {
        filtered = filtered.filter(transaction => transaction.type === filterType);
      }
      
      setFilteredTransactions(filtered);
    } else {
      setFilteredTransactions([]);
    }
  }, [transactions, searchQuery, filterType]);

  const fetchTransactions = async () => {
    setLoading(true);
    try {
      // In a real app, this would fetch from your API
      // Simulating API call for demo purposes
      setTimeout(() => {
        const mockTransactions = [
          {
            id: 1,
            type: 'received',
            amount: 125.00,
            currencyCode: 'USD',
            date: '2025-05-18T10:30:00',
            sender: 'John Smith',
            description: 'Rent payment'
          },
          {
            id: 2,
            type: 'sent',
            amount: 45.50,
            currencyCode: 'USD',
            date: '2025-05-17T14:15:00',
            recipient: 'Coffee Shop',
            description: 'Coffee with friends'
          },
          {
            id: 3,
            type: 'deposit',
            amount: 500.00,
            currencyCode: 'USD',
            date: '2025-05-15T09:45:00',
            source: 'Bank Transfer',
            description: 'Monthly deposit'
          },
          {
            id: 4,
            type: 'withdraw',
            amount: 200.00,
            currencyCode: 'USD',
            date: '2025-05-13T16:20:00',
            destination: 'ATM Withdrawal',
            description: 'Cash withdrawal'
          },
          {
            id: 5,
            type: 'sent',
            amount: 35.99,
            currencyCode: 'USD',
            date: '2025-05-12T12:10:00',
            recipient: 'Online Store',
            description: 'Online purchase'
          },
          {
            id: 6,
            type: 'received',
            amount: 75.25,
            currencyCode: 'USD',
            date: '2025-05-10T08:40:00',
            sender: 'Sarah Johnson',
            description: 'Shared expenses'
          },
          {
            id: 7,
            type: 'deposit',
            amount: 250.00,
            currencyCode: 'USD',
            date: '2025-05-05T11:30:00',
            source: 'PayPal Transfer',
            description: 'Freelance payment'
          }
        ];
        
        setTransactions(mockTransactions);
        setFilteredTransactions(mockTransactions);
        setLoading(false);
      }, 1000);
    } catch (error) {
      Alert.alert('Error', 'Failed to load transactions');
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchTransactions();
    setRefreshing(false);
  };

  const clearSearch = () => {
    setSearchQuery('');
  };

  const renderFilterChip = (label, value) => (
    <TouchableOpacity
      style={[
        styles.filterChip,
        filterType === value && styles.activeFilterChip
      ]}
      onPress={() => setFilterType(value)}
    >
      <Text
        style={[
          styles.filterChipText,
          filterType === value && styles.activeFilterChipText
        ]}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );

  if (loading && !refreshing && transactions.length === 0) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4f46e5" />
        <Text style={styles.loadingText}>Loading transactions...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <Ionicons name="search-outline" size={20} color="#9ca3af" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search transactions"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={clearSearch}>
              <Ionicons name="close-circle" size={20} color="#9ca3af" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Filter Chips */}
      <View style={styles.filterContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterScroll}>
          {renderFilterChip('All', 'all')}
          {renderFilterChip('Received', 'received')}
          {renderFilterChip('Sent', 'sent')}
          {renderFilterChip('Deposits', 'deposit')}
          {renderFilterChip('Withdrawals', 'withdraw')}
        </ScrollView>
      </View>

      {/* Transaction List */}
      <FlatList
        data={filteredTransactions}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <TransactionItem
            transaction={item}
            onPress={() => {
              // Navigate to transaction details in a real app
              Alert.alert('Transaction Details', `Amount: ${item.amount} ${item.currencyCode}\nDescription: ${item.description || 'N/A'}`);
            }}
          />
        )}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="document-text-outline" size={48} color="#d1d5db" />
            <Text style={styles.emptyStateText}>No transactions found</Text>
            {searchQuery || filterType !== 'all' ? (
              <Text style={styles.emptyStateSubtext}>
                Try adjusting your filters
              </Text>
            ) : null}
          </View>
        }
      />
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
  searchContainer: {
    padding: 16,
    backgroundColor: '#ffffff',
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f3f4f6',
    borderRadius: 8,
    paddingHorizontal: 12,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: 40,
    fontSize: 16,
    color: '#111827',
  },
  filterContainer: {
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
    paddingBottom: 12,
  },
  filterScroll: {
    paddingHorizontal: 16,
    flexDirection: 'row',
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
    backgroundColor: '#f3f4f6',
    marginRight: 8,
  },
  activeFilterChip: {
    backgroundColor: 'rgba(79, 70, 229, 0.1)',
  },
  filterChipText: {
    color: '#6b7280',
    fontWeight: '500',
  },
  activeFilterChipText: {
    color: '#4f46e5',
    fontWeight: '600',
  },
  listContent: {
    padding: 16,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 48,
  },
  emptyStateText: {
    marginTop: 16,
    fontSize: 16,
    fontWeight: '500',
    color: '#6b7280',
  },
  emptyStateSubtext: {
    marginTop: 8,
    fontSize: 14,
    color: '#9ca3af',
    textAlign: 'center',
  },
});