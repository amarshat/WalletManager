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

export default function AddMoneyScreen({ navigation }) {
  const { user } = useAuth();
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [accounts, setAccounts] = useState([]);
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('card'); // 'card', 'bank', 'crypto'
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState(null);

  useEffect(() => {
    // Load user accounts and payment methods
    fetchUserAccounts();
    fetchPaymentMethods();
  }, []);

  const fetchUserAccounts = async () => {
    // In a real app, this would fetch from your API
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

  const fetchPaymentMethods = async () => {
    // In a real app, this would fetch from your API
    setTimeout(() => {
      setPaymentMethods([
        { 
          id: 1, 
          type: 'card',
          last4: '4567',
          expiryMonth: 9,
          expiryYear: 26,
          brand: 'mastercard'
        },
        { 
          id: 2, 
          type: 'card',
          last4: '8901',
          expiryMonth: 3,
          expiryYear: 27,
          brand: 'visa'
        },
        {
          id: 3,
          type: 'bank',
          bankName: 'Chase Bank',
          accountLast4: '7890',
          accountType: 'Checking'
        }
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

  const getPaymentMethodIcon = (method) => {
    if (method.type === 'card') {
      return method.brand === 'visa' ? 'card-outline' : 'card';
    } else if (method.type === 'bank') {
      return 'business-outline';
    } else {
      return 'wallet-outline';
    }
  };

  const getPaymentMethodDisplay = (method) => {
    if (method.type === 'card') {
      return `${method.brand.toUpperCase()} •••• ${method.last4}`;
    } else if (method.type === 'bank') {
      return `${method.bankName} •••• ${method.accountLast4}`;
    }
    return '';
  };

  const validateForm = () => {
    if (!amount || isNaN(parseFloat(amount)) || parseFloat(amount) <= 0) {
      Alert.alert('Error', 'Please enter a valid amount');
      return false;
    }
    
    if (!selectedAccount) {
      Alert.alert('Error', 'Please select an account to add money to');
      return false;
    }
    
    if (!selectedPaymentMethod) {
      Alert.alert('Error', 'Please select a payment method');
      return false;
    }
    
    return true;
  };

  const handleAddMoney = async () => {
    if (!validateForm()) return;
    
    setLoading(true);
    
    try {
      // In a real app, this would make an API call to process the deposit
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Show success message
      Alert.alert(
        'Deposit Successful',
        `${formatCurrency(parseFloat(amount), selectedAccount.currencyCode)} has been added to your account`,
        [
          {
            text: 'OK',
            onPress: () => navigation.goBack()
          }
        ]
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to process deposit. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const filteredPaymentMethods = paymentMethods.filter(
    method => method.type === paymentMethod
  );

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* To Account Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>To</Text>
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
          
          {/* Quick Amounts */}
          <View style={styles.quickAmounts}>
            <TouchableOpacity
              style={styles.quickAmountButton}
              onPress={() => setAmount('10')}
            >
              <Text style={styles.quickAmountText}>+$10</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.quickAmountButton}
              onPress={() => setAmount('25')}
            >
              <Text style={styles.quickAmountText}>+$25</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.quickAmountButton}
              onPress={() => setAmount('50')}
            >
              <Text style={styles.quickAmountText}>+$50</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.quickAmountButton}
              onPress={() => setAmount('100')}
            >
              <Text style={styles.quickAmountText}>+$100</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Payment Method */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Payment Method</Text>
          
          {/* Payment Method Tabs */}
          <View style={styles.paymentTabs}>
            <TouchableOpacity
              style={[
                styles.paymentTab,
                paymentMethod === 'card' && styles.activePaymentTab
              ]}
              onPress={() => {
                setPaymentMethod('card');
                setSelectedPaymentMethod(null);
              }}
            >
              <Ionicons
                name="card-outline"
                size={20}
                color={paymentMethod === 'card' ? '#4f46e5' : '#6b7280'}
              />
              <Text
                style={[
                  styles.paymentTabText,
                  paymentMethod === 'card' && styles.activePaymentTabText
                ]}
              >
                Card
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[
                styles.paymentTab,
                paymentMethod === 'bank' && styles.activePaymentTab
              ]}
              onPress={() => {
                setPaymentMethod('bank');
                setSelectedPaymentMethod(null);
              }}
            >
              <Ionicons
                name="business-outline"
                size={20}
                color={paymentMethod === 'bank' ? '#4f46e5' : '#6b7280'}
              />
              <Text
                style={[
                  styles.paymentTabText,
                  paymentMethod === 'bank' && styles.activePaymentTabText
                ]}
              >
                Bank
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[
                styles.paymentTab,
                paymentMethod === 'crypto' && styles.activePaymentTab
              ]}
              onPress={() => {
                setPaymentMethod('crypto');
                setSelectedPaymentMethod(null);
              }}
            >
              <Ionicons
                name="wallet-outline"
                size={20}
                color={paymentMethod === 'crypto' ? '#4f46e5' : '#6b7280'}
              />
              <Text
                style={[
                  styles.paymentTabText,
                  paymentMethod === 'crypto' && styles.activePaymentTabText
                ]}
              >
                Crypto
              </Text>
            </TouchableOpacity>
          </View>
          
          {/* Payment Method List */}
          <View style={styles.paymentMethodsContainer}>
            {filteredPaymentMethods.length === 0 ? (
              <View style={styles.emptyPaymentMethods}>
                <Text style={styles.emptyPaymentMethodsText}>
                  No {paymentMethod === 'card' ? 'cards' : 
                      paymentMethod === 'bank' ? 'bank accounts' : 
                      'crypto wallets'} found
                </Text>
                <TouchableOpacity
                  style={styles.addPaymentMethodButton}
                  onPress={() => {
                    // In a real app, navigate to add payment method screen
                    Alert.alert('Add Payment Method', 'This feature is coming soon!');
                  }}
                >
                  <Text style={styles.addPaymentMethodText}>
                    + Add {paymentMethod === 'card' ? 'Card' : 
                           paymentMethod === 'bank' ? 'Bank Account' : 
                           'Crypto Wallet'}
                  </Text>
                </TouchableOpacity>
              </View>
            ) : (
              <>
                {filteredPaymentMethods.map(method => (
                  <TouchableOpacity
                    key={method.id}
                    style={[
                      styles.paymentMethodItem,
                      selectedPaymentMethod?.id === method.id && styles.selectedPaymentMethod
                    ]}
                    onPress={() => setSelectedPaymentMethod(method)}
                  >
                    <View style={styles.paymentMethodIcon}>
                      <Ionicons
                        name={getPaymentMethodIcon(method)}
                        size={24}
                        color="#4f46e5"
                      />
                    </View>
                    <View style={styles.paymentMethodInfo}>
                      <Text style={styles.paymentMethodTitle}>
                        {method.type === 'card' ? method.brand.toUpperCase() : method.bankName}
                      </Text>
                      <Text style={styles.paymentMethodDetail}>
                        {getPaymentMethodDisplay(method)}
                      </Text>
                    </View>
                    {selectedPaymentMethod?.id === method.id && (
                      <Ionicons name="checkmark-circle" size={24} color="#4f46e5" />
                    )}
                  </TouchableOpacity>
                ))}
                
                <TouchableOpacity
                  style={styles.addPaymentMethodItem}
                  onPress={() => {
                    // In a real app, navigate to add payment method screen
                    Alert.alert('Add Payment Method', 'This feature is coming soon!');
                  }}
                >
                  <View style={styles.addPaymentMethodIcon}>
                    <Ionicons name="add" size={24} color="#4f46e5" />
                  </View>
                  <Text style={styles.addPaymentMethodItemText}>
                    Add New {paymentMethod === 'card' ? 'Card' : 
                              paymentMethod === 'bank' ? 'Bank Account' : 
                              'Crypto Wallet'}
                  </Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>

        {/* Add Money Button */}
        <TouchableOpacity
          style={styles.addButton}
          onPress={handleAddMoney}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#ffffff" />
          ) : (
            <>
              <Ionicons name="add-circle" size={20} color="#ffffff" style={styles.addIcon} />
              <Text style={styles.addButtonText}>Add Money</Text>
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
  quickAmounts: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
  },
  quickAmountButton: {
    backgroundColor: 'rgba(79, 70, 229, 0.1)',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 16,
  },
  quickAmountText: {
    color: '#4f46e5',
    fontWeight: '500',
  },
  paymentTabs: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    borderRadius: 8,
    marginBottom: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  paymentTab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activePaymentTab: {
    borderBottomColor: '#4f46e5',
    backgroundColor: 'rgba(79, 70, 229, 0.05)',
  },
  paymentTabText: {
    marginLeft: 8,
    color: '#6b7280',
    fontWeight: '500',
  },
  activePaymentTabText: {
    color: '#4f46e5',
  },
  paymentMethodsContainer: {
    borderRadius: 8,
    overflow: 'hidden',
  },
  emptyPaymentMethods: {
    backgroundColor: '#ffffff',
    padding: 24,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  emptyPaymentMethodsText: {
    color: '#6b7280',
    fontSize: 16,
    marginBottom: 16,
  },
  addPaymentMethodButton: {
    backgroundColor: '#4f46e5',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  addPaymentMethodText: {
    color: '#ffffff',
    fontWeight: '500',
  },
  paymentMethodItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    padding: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    marginBottom: 8,
    borderRadius: 8,
  },
  selectedPaymentMethod: {
    borderColor: '#4f46e5',
    borderWidth: 2,
    backgroundColor: 'rgba(79, 70, 229, 0.05)',
  },
  paymentMethodIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(79, 70, 229, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  paymentMethodInfo: {
    flex: 1,
  },
  paymentMethodTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#111827',
    marginBottom: 4,
  },
  paymentMethodDetail: {
    fontSize: 14,
    color: '#6b7280',
  },
  addPaymentMethodItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    padding: 16,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: '#d1d5db',
    borderRadius: 8,
  },
  addPaymentMethodIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(79, 70, 229, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  addPaymentMethodItemText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#4f46e5',
  },
  addButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#4f46e5',
    borderRadius: 8,
    paddingVertical: 16,
    marginTop: 16,
    marginBottom: 32,
  },
  addIcon: {
    marginRight: 8,
  },
  addButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
});