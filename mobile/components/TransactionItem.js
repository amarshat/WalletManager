import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function TransactionItem({ transaction, onPress }) {
  // Format currency based on code
  const formatCurrency = (amount, code) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: code,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  };

  // Format date to readable format
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    
    // If today, show time
    const today = new Date();
    if (date.toDateString() === today.toDateString()) {
      return date.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      });
    }
    
    // Otherwise show date
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  };

  // Determine icon and colors based on transaction type
  const getTransactionDetails = (type) => {
    switch (type) {
      case 'sent':
        return {
          icon: 'arrow-up-outline',
          color: '#ef4444',
          background: 'rgba(239, 68, 68, 0.1)'
        };
      case 'received':
        return {
          icon: 'arrow-down-outline',
          color: '#10b981',
          background: 'rgba(16, 185, 129, 0.1)'
        };
      case 'deposit':
        return {
          icon: 'add-circle-outline',
          color: '#3b82f6',
          background: 'rgba(59, 130, 246, 0.1)'
        };
      case 'withdraw':
        return {
          icon: 'remove-circle-outline',
          color: '#f59e0b',
          background: 'rgba(245, 158, 11, 0.1)'
        };
      default:
        return {
          icon: 'swap-horizontal-outline',
          color: '#8b5cf6',
          background: 'rgba(139, 92, 246, 0.1)'
        };
    }
  };

  const details = getTransactionDetails(transaction.type);

  // Determine transaction name
  const getTransactionName = () => {
    if (transaction.type === 'sent') {
      return transaction.recipient || 'Payment Sent';
    } else if (transaction.type === 'received') {
      return transaction.sender || 'Payment Received';
    } else if (transaction.type === 'deposit') {
      return transaction.source || 'Deposit';
    } else if (transaction.type === 'withdraw') {
      return transaction.destination || 'Withdrawal';
    }
    return 'Transaction';
  };

  return (
    <TouchableOpacity style={styles.container} onPress={onPress}>
      <View style={[styles.iconContainer, { backgroundColor: details.background }]}>
        <Ionicons name={details.icon} size={20} color={details.color} />
      </View>
      
      <View style={styles.details}>
        <Text style={styles.name}>{getTransactionName()}</Text>
        <Text style={styles.description}>{transaction.description || formatDate(transaction.date)}</Text>
      </View>
      
      <View style={styles.amountContainer}>
        <Text style={[
          styles.amount, 
          transaction.type === 'sent' || transaction.type === 'withdraw' 
            ? styles.negativeAmount 
            : styles.positiveAmount
        ]}>
          {transaction.type === 'sent' || transaction.type === 'withdraw' ? '- ' : '+ '}
          {formatCurrency(transaction.amount, transaction.currencyCode)}
        </Text>
        <Text style={styles.date}>{formatDate(transaction.date)}</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  details: {
    flex: 1,
  },
  name: {
    fontSize: 16,
    fontWeight: '500',
    color: '#111827',
    marginBottom: 4,
  },
  description: {
    fontSize: 14,
    color: '#6b7280',
  },
  amountContainer: {
    alignItems: 'flex-end',
  },
  amount: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  positiveAmount: {
    color: '#10b981',
  },
  negativeAmount: {
    color: '#ef4444',
  },
  date: {
    fontSize: 12,
    color: '#9ca3af',
  },
});