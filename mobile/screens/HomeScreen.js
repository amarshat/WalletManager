import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Image,
  ActivityIndicator
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import WalletCard from '../components/WalletCard';
import ActionButton from '../components/ActionButton';
import TransactionItem from '../components/TransactionItem';

export default function HomeScreen({ navigation }) {
  const { user } = useAuth();
  const [refreshing, setRefreshing] = useState(false);
  const [walletData, setWalletData] = useState(null);
  const [recentTransactions, setRecentTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchWalletData();
    fetchRecentTransactions();
  }, []);

  const fetchWalletData = async () => {
    // In a real app, this would fetch from your API
    // Simulating API call for demo purposes
    setLoading(true);
    
    setTimeout(() => {
      setWalletData({
        balance: 1250.75,
        currencyCode: 'USD',
        accounts: [
          { id: 1, balance: 1250.75, currencyCode: 'USD' },
          { id: 2, balance: 150.00, currencyCode: 'EUR' }
        ]
      });
      setLoading(false);
    }, 1000);
  };

  const fetchRecentTransactions = async () => {
    // In a real app, this would fetch from your API
    // Simulating API call for demo purposes
    setTimeout(() => {
      setRecentTransactions([
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
        }
      ]);
    }, 1000);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([fetchWalletData(), fetchRecentTransactions()]);
    setRefreshing(false);
  };

  const handleAddMoney = () => {
    navigation.navigate('AddMoney');
  };

  const handleSendMoney = () => {
    navigation.navigate('SendMoney');
  };

  const handleViewAllTransactions = () => {
    navigation.navigate('Transactions');
  };

  const handleViewCarbonImpact = () => {
    navigation.navigate('CarbonImpact');
  };

  if (loading && !walletData) {
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
      {/* Welcome Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Hello, {user?.fullName || user?.username}</Text>
          <Text style={styles.date}>
            {new Date().toLocaleDateString('en-US', {
              weekday: 'long',
              month: 'long',
              day: 'numeric'
            })}
          </Text>
        </View>
        <TouchableOpacity onPress={() => navigation.navigate('Profile')}>
          <View style={styles.avatarContainer}>
            <Text style={styles.avatarText}>
              {(user?.fullName || user?.username).charAt(0).toUpperCase()}
            </Text>
          </View>
        </TouchableOpacity>
      </View>

      {/* Wallet Card */}
      {walletData && (
        <WalletCard
          balance={walletData.balance}
          currencyCode={walletData.currencyCode}
          onAddMoney={handleAddMoney}
          onSendMoney={handleSendMoney}
          onRefresh={onRefresh}
        />
      )}

      {/* Quick Actions */}
      <View style={styles.actionsContainer}>
        <ActionButton
          icon="add-circle-outline"
          label="Add Money"
          onPress={handleAddMoney}
        />
        <ActionButton
          icon="send-outline"
          label="Send Money"
          onPress={handleSendMoney}
        />
        <ActionButton
          icon="card-outline"
          label="My Cards"
          onPress={() => navigation.navigate('Cards')}
        />
        <ActionButton
          icon="leaf-outline"
          label="Carbon Impact"
          onPress={handleViewCarbonImpact}
        />
      </View>

      {/* Recent Transactions */}
      <View style={styles.sectionContainer}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recent Transactions</Text>
          <TouchableOpacity onPress={handleViewAllTransactions}>
            <Text style={styles.viewAllText}>View All</Text>
          </TouchableOpacity>
        </View>

        {recentTransactions.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="time-outline" size={48} color="#d1d5db" />
            <Text style={styles.emptyStateText}>No recent transactions</Text>
          </View>
        ) : (
          recentTransactions.map(transaction => (
            <TransactionItem
              key={transaction.id}
              transaction={transaction}
              onPress={() => {
                /* Handle transaction press */
              }}
            />
          ))
        )}
      </View>

      {/* Eco Impact Summary (simplified) */}
      <TouchableOpacity
        style={styles.ecoCard}
        onPress={handleViewCarbonImpact}
      >
        <View style={styles.ecoContent}>
          <Ionicons name="leaf" size={24} color="#10b981" />
          <View style={styles.ecoTextContainer}>
            <Text style={styles.ecoTitle}>Carbon Impact Tracker</Text>
            <Text style={styles.ecoDescription}>
              Track your spending's environmental impact
            </Text>
          </View>
        </View>
        <Ionicons name="chevron-forward" size={20} color="#6b7280" />
      </TouchableOpacity>

      <View style={styles.footer}>
        <Text style={styles.footerText}>PaySage Wallet Mobile</Text>
        <Text style={styles.versionText}>Version 1.0.0</Text>
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
    flex: a,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#4f46e5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
  },
  greeting: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
  },
  date: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 4,
  },
  avatarContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#4f46e5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginTop: 16,
    marginBottom: 24,
  },
  sectionContainer: {
    marginBottom: 24,
    paddingHorizontal: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
  },
  viewAllText: {
    fontSize: 14,
    color: '#4f46e5',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    marginTop: 8,
  },
  emptyStateText: {
    marginTop: 12,
    fontSize: 16,
    color: '#6b7280',
  },
  ecoCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#ecfdf5',
    padding: 16,
    marginHorizontal: 16,
    borderRadius: 12,
    marginBottom: 24,
  },
  ecoContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ecoTextContainer: {
    marginLeft: 12,
  },
  ecoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#047857',
  },
  ecoDescription: {
    fontSize: 14,
    color: '#065f46',
    marginTop: 2,
  },
  footer: {
    alignItems: 'center',
    paddingBottom: 32,
  },
  footerText: {
    fontSize: 14,
    color: '#6b7280',
  },
  versionText: {
    fontSize: 12,
    color: '#9ca3af',
    marginTop: 4,
  },
});