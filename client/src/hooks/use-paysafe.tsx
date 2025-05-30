import { useMemo } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { supportedCurrencies } from "@shared/schema";

export function usePaysafe() {
  const { toast } = useToast();
  const { user } = useAuth();
  
  // Get wallet and balances
  const {
    data: walletData,
    isLoading: isLoadingWallet,
    error: walletError,
    refetch: refetchWallet
  } = useQuery({
    queryKey: ["/api/wallet"],
    enabled: !!user,
  });
  
  // Get transactions
  const {
    data: transactionsData,
    isLoading: isLoadingTransactions,
    error: transactionsError,
    refetch: refetchTransactions
  } = useQuery({
    queryKey: ["/api/transactions"],
    enabled: !!user,
  });
  
  // Get cards
  const {
    data: cardsData,
    isLoading: isLoadingCards,
    error: cardsError,
    refetch: refetchCards
  } = useQuery({
    queryKey: ["/api/cards"],
    enabled: !!user,
  });
  
  // Processed balances
  const balances = useMemo(() => {
    // Add debugging to see what we're getting from the API
    console.log('Wallet data from API:', walletData);
    
    // Handle case where balances might be in different formats
    const accounts = walletData?.balances?.accounts || [];
    
    console.log('Raw account data:', accounts);
    
    return accounts.map((account: any) => {
      // Ensure we have valid numbers for balances (or default to 0)
      const rawBalance = account.balance || account.availableBalance;
      
      console.log(`Processing account ${account.currencyCode}:`, {
        rawBalance,
        accountData: account 
      });
      
      // Handle both string and number formats for balance values
      // Convert string balance to number, handle null and undefined cases
      const availableBalance = rawBalance !== null && rawBalance !== undefined
        ? Number(rawBalance) // Convert string to number
        : 0;
      
      // Convert totalBalance if exists, otherwise use availableBalance
      const totalBalance = account.totalBalance !== null && account.totalBalance !== undefined
        ? Number(account.totalBalance)
        : availableBalance; // Default to availableBalance if totalBalance is not provided
      
      return {
        currencyCode: account.currencyCode,
        availableBalance: availableBalance,
        totalBalance: totalBalance,
        currencySymbol: supportedCurrencies.find(c => c.code === account.currencyCode)?.symbol || '$'
      };
    });
  }, [walletData]);
  
  // Current active currencies
  const activeCurrencies = useMemo(() => {
    if (!balances.length) return supportedCurrencies;
    
    return balances.map(balance => {
      const currency = supportedCurrencies.find(c => c.code === balance.currencyCode);
      return currency || { code: balance.currencyCode, name: balance.currencyCode, symbol: '$' };
    });
  }, [balances]);
  
  // Formatted transactions
  const transactions = useMemo(() => {
    if (!transactionsData) return [];
    
    // Add debugging to see what transactions we're getting from the API
    console.log('Raw transactions data from API:', transactionsData);
    
    // Handle different response formats (direct array or {transactions: array})
    const transactionArray = Array.isArray(transactionsData) 
      ? transactionsData 
      : (transactionsData.transactions || []);
      
    console.log('Transaction array after formatting:', transactionArray);
    
    return transactionArray.map((transaction: any) => {
      let type: 'DEPOSIT' | 'TRANSFER_IN' | 'TRANSFER_OUT' | 'WITHDRAWAL' | 'EXCHANGE' = 'DEPOSIT';
      let counterparty;
      
      // Determine transaction type
      if (transaction.type === 'DEPOSIT' || transaction.transactionType === 'DEPOSIT') {
        type = 'DEPOSIT';
      } else if (transaction.type === 'TRANSFER' || transaction.transactionType === 'TRANSFER') {
        // Check if current user is source or destination
        if (walletData?.wallet?.customerId === transaction.sourceCustomerId) {
          type = 'TRANSFER_OUT';
          counterparty = transaction.destinationCustomerId;
        } else if (walletData?.wallet?.customerId === transaction.destinationCustomerId) {
          type = 'TRANSFER_IN';
          counterparty = transaction.sourceCustomerId;
        } else if (transaction.note && transaction.note.includes('Admin transfer')) {
          // Fix for admin transfers - they should be displayed as TRANSFER_OUT
          type = 'TRANSFER_OUT';
          counterparty = transaction.destinationCustomerId || 'Customer';
        } else {
          type = 'TRANSFER_IN';
          counterparty = transaction.sourceCustomerId || 'Admin';
        }
      } else if (transaction.type === 'WITHDRAWAL' || transaction.transactionType === 'WITHDRAWAL') {
        type = 'WITHDRAWAL';
      } else if (transaction.type === 'EXCHANGE' || transaction.transactionType === 'EXCHANGE') {
        type = 'EXCHANGE';
      }
      
      // Ensure transaction amounts are properly converted from strings to numbers when needed
      const amount = transaction.amount !== null && transaction.amount !== undefined
        ? Number(transaction.amount) // Convert to number if needed
        : 0;
  
      const destinationAmount = transaction.destinationAmount !== null && transaction.destinationAmount !== undefined
        ? Number(transaction.destinationAmount)
        : null;
        
      // Create the formatted transaction object
      const formattedTransaction = {
        id: transaction.id,
        type,
        amount,
        currencyCode: transaction.currencyCode,
        timestamp: transaction.timestamp || transaction.createdDate || transaction.createdAt || new Date().toISOString(),
        status: transaction.status,
        counterparty,
        note: transaction.note,
        destinationCurrencyCode: transaction.destinationCurrencyCode,
        destinationAmount
      };
      
      console.log(`Processed transaction ${transaction.id}:`, {
        original: {
          type: transaction.type,
          transactionType: transaction.transactionType,
          amount: transaction.amount
        },
        processed: formattedTransaction
      });
      
      return formattedTransaction;
    });
  }, [transactionsData, walletData]);
  
  // Refresh all wallet data with more reliable ordering
  const refreshAllData = async () => {
    // First refresh wallet data to get current balances
    await refetchWallet();
    // Then refresh transactions and cards
    await Promise.all([
      refetchTransactions(),
      refetchCards()
    ]);
  };
  
  return {
    wallet: walletData?.wallet,
    walletData, // Add direct access to walletData
    balances,
    transactions,
    cards: cardsData || [],
    activeCurrencies,
    isLoadingWallet,
    isLoadingTransactions,
    isLoadingCards,
    walletError,
    transactionsError,
    cardsError,
    refreshWallet: refetchWallet,
    refreshTransactions: refetchTransactions,
    refreshCards: refetchCards,
    refreshAllData
  };
}
