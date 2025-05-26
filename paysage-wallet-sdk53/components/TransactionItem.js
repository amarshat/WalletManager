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
