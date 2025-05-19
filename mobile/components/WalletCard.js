import React from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  TouchableOpacity 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function WalletCard({ 
  balance, 
  currencyCode, 
  onAddMoney, 
  onSendMoney, 
  onRefresh,
  loading = false
}) {
  // Format currency based on code
  const formatCurrency = (amount, code) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: code,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  };

  return (
    <View style={styles.cardContainer}>
      <View style={styles.card}>
        <View style={styles.balanceContainer}>
          <View style={styles.balanceHeader}>
            <Text style={styles.balanceLabel}>Available Balance</Text>
            <TouchableOpacity 
              style={styles.refreshButton} 
              onPress={onRefresh}
              disabled={loading}
            >
              <Ionicons 
                name="refresh-outline" 
                size={20} 
                color="#fff" 
                style={loading ? styles.rotating : null} 
              />
            </TouchableOpacity>
          </View>
          <Text style={styles.balanceAmount}>
            {formatCurrency(balance, currencyCode)}
          </Text>
        </View>
        
        <View style={styles.buttons}>
          <TouchableOpacity style={styles.button} onPress={onAddMoney}>
            <Ionicons name="add-circle-outline" size={20} color="#fff" />
            <Text style={styles.buttonText}>Add</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.button} onPress={onSendMoney}>
            <Ionicons name="send-outline" size={20} color="#fff" />
            <Text style={styles.buttonText}>Send</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  cardContainer: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  card: {
    backgroundColor: '#4f46e5',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#4f46e5',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  balanceContainer: {
    marginBottom: 20,
  },
  balanceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  balanceLabel: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 14,
  },
  refreshButton: {
    padding: 4,
  },
  balanceAmount: {
    color: '#ffffff',
    fontSize: 32,
    fontWeight: 'bold',
  },
  buttons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    flex: 1,
    marginHorizontal: 5,
    justifyContent: 'center',
  },
  buttonText: {
    color: '#ffffff',
    marginLeft: 8,
    fontWeight: '500',
  },
  rotating: {
    transform: [{ rotate: '45deg' }],
  },
});