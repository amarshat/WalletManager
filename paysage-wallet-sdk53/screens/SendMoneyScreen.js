import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
  Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';

export default function SendMoneyScreen({ navigation }) {
  const { user } = useAuth();
  const [recipient, setRecipient] = useState('');
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(false);
  const [accounts, setAccounts] = useState([]);
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [recentRecipients, setRecentRecipients] = useState([]);

  useEffect(() => {
    // Load user accounts and recent recipients
    fetchUserAccounts();
    fetchRecentRecipients();
  }, []);

  const fetchUserAccounts = async () => {
    // In a real app, this would fetch from your API
    // Simulating API call for demo purposes
    setTimeout(() => {
      const mockAccounts = [
        { id: 1, balance: 1250.75, currencyCode: 'USD', primary: true },
        { id: 2, balance: 150.00, currencyCode: 'EUR', primary: false }
      ];
      
      setAccounts(mockAccounts);
      // Set primary account as default
      setSelectedAccount(mockAccounts.find(acc => acc.primary) || mockAccounts[0]);
    }, 500);
  };

  const fetchRecentRecipients = async () => {
    // In a real app, this would fetch from your API
    // Simulating API call for demo purposes
    setTimeout(() => {
      setRecentRecipients([
        { id: 1, name: 'John Smith', username: 'johnsmith', recent: true },
        { id: 2, name: 'Sarah Johnson', username: 'sarahj', recent: true },
        { id: 3, name: 'Mike Brown', username: 'mikebrown', recent: true },
      ]);
    }, 500);
  };

  const formatCurrency = (amount, code) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: code,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  };

  const handleRecipientSelect = (selectedRecipient) => {
    setRecipient(selectedRecipient.username);
  };

  const validateForm = () => {
    if (!recipient) {
      Alert.alert('Error', 'Please enter a recipient');
      return false;
    }
    
    if (!amount || isNaN(parseFloat(amount)) || parseFloat(amount) <= 0) {
      Alert.alert('Error', 'Please enter a valid amount');
      return false;
    }
    
    if (!selectedAccount) {
      Alert.alert('Error', 'Please select an account to send from');
      return false;
    }
    
    // Check if user has sufficient balance
    if (parseFloat(amount) > selectedAccount.balance) {
      Alert.alert('Error', 'Insufficient balance');
      return false;
    }
    
    return true;
  };

  const handleSendMoney = async () => {
    if (!validateForm()) return;
    
    setLoading(true);
    
    try {
      // In a real app, this would make an API call to process the payment
      // Simulating API call for demo purposes
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Show success message
      Alert.alert(
        'Payment Successful',
        `${formatCurrency(parseFloat(amount), selectedAccount.currencyCode)} has been sent to ${recipient}`,
        [
          {
            text: 'OK',
            onPress: () => navigation.goBack()
          }
        ]
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to process payment. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* From Account Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>From</Text>
          <View style={styles.accountsContainer}>
            {accounts.map(account => (
              <TouchableOpacity
                key={account.id}
                style={[
                  styles.accountItem,
                  selectedAccount?.id === account.id && styles.selectedAccount
                ]}
                onPress={() => setSelectedAccount(account)}
              >
                <View style={styles.accountInfo}>
                  <Text style={styles.accountName}>
                    {account.currencyCode} Account
                    {account.primary && ' (Primary)'}
                  </Text>
                  <Text style={styles.accountBalance}>
                    {formatCurrency(account.balance, account.currencyCode)}
                  </Text>
                </View>
                {selectedAccount?.id === account.id && (
                  <Ionicons name="checkmark-circle" size={24} color="#4f46e5" />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Recipient */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>To</Text>
          <View style={styles.inputContainer}>
            <Ionicons name="person-outline" size={20} color="#9ca3af" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Username or email"
              value={recipient}
              onChangeText={setRecipient}
              autoCapitalize="none"
            />
          </View>
          
          {/* Recent Recipients */}
          {recipient === '' && recentRecipients.length > 0 && (
            <View style={styles.recentContainer}>
              <Text style={styles.recentTitle}>Recent</Text>
              <View style={styles.recentList}>
                {recentRecipients.map(recipientItem => (
                  <TouchableOpacity
                    key={recipientItem.id}
                    style={styles.recentItem}
                    onPress={() => handleRecipientSelect(recipientItem)}
                  >
                    <View style={styles.recipientAvatar}>
                      <Text style={styles.avatarText}>
                        {recipientItem.name.charAt(0).toUpperCase()}
                      </Text>
                    </View>
                    <View style={styles.recipientInfo}>
                      <Text style={styles.recipientName}>{recipientItem.name}</Text>
                      <Text style={styles.recipientUsername}>{recipientItem.username}</Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}
        </View>

        {/* Amount */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Amount</Text>
          <View style={styles.amountContainer}>
            <Text style={styles.currencySymbol}>
              {selectedAccount ? selectedAccount.currencyCode : 'USD'}
            </Text>
            <TextInput
              style={styles.amountInput}
              placeholder="0.00"
              value={amount}
              onChangeText={setAmount}
              keyboardType="decimal-pad"
            />
          </View>
          {selectedAccount && (
            <Text style={styles.balanceInfo}>
              Available balance: {formatCurrency(selectedAccount.balance, selectedAccount.currencyCode)}
            </Text>
          )}
        </View>

        {/* Note */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Note (Optional)</Text>
          <View style={styles.inputContainer}>
            <Ionicons name="create-outline" size={20} color="#9ca3af" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="What's this payment for?"
              value={note}
              onChangeText={setNote}
              multiline={true}
              numberOfLines={3}
            />
          </View>
        </View>

        {/* Send Button */}
        <TouchableOpacity
          style={styles.sendButton}
          onPress={handleSendMoney}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#ffffff" />
          ) : (
            <>
              <Ionicons name="send" size={20} color="#ffffff" style={styles.sendIcon} />
              <Text style={styles.sendButtonText}>Send Money</Text>
            </>
          )}
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  scrollContent: {
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 12,
  },
  accountsContainer: {
    borderRadius: 8,
    overflow: 'hidden',
  },
  accountItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    padding: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    marginBottom: 8,
    borderRadius: 8,
  },
  selectedAccount: {
    borderColor: '#4f46e5',
    borderWidth: 2,
    backgroundColor: 'rgba(79, 70, 229, 0.05)',
  },
  accountInfo: {
    flex: 1,
  },
  accountName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#111827',
    marginBottom: 4,
  },
  accountBalance: {
    fontSize: 14,
    color: '#6b7280',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 8,
    paddingHorizontal: 12,
  },
  inputIcon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    height: 50,
    fontSize: 16,
    color: '#111827',
  },
  recentContainer: {
    marginTop: 16,
  },
  recentTitle: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 8,
  },
  recentList: {
    backgroundColor: '#ffffff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    overflow: 'hidden',
  },
  recentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  recipientAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#4f46e5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  recipientInfo: {
    flex: 1,
  },
  recipientName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#111827',
    marginBottom: 2,
  },
  recipientUsername: {
    fontSize: 14,
    color: '#6b7280',
  },
  amountContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 8,
    paddingHorizontal: 12,
  },
  currencySymbol: {
    fontSize: 18,
    fontWeight: '500',
    color: '#6b7280',
    marginRight: 8,
  },
  amountInput: {
    flex: 1,
    height: 50,
    fontSize: 24,
    fontWeight: '600',
    color: '#111827',
  },
  balanceInfo: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 8,
  },
  sendButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#4f46e5',
    borderRadius: 8,
    paddingVertical: 16,
    marginTop: 16,
    marginBottom: 32,
  },
  sendIcon: {
    marginRight: 8,
  },
  sendButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
});