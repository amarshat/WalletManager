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
    // Handle case where balances might be in different formats
    const accounts = walletData?.balances?.accounts || [];
    
    return accounts.map((account: any) => {
      // Ensure we have valid numbers for balances (or default to 0)
      const availableBalance = typeof account.availableBalance === 'number' && !isNaN(account.availableBalance) 
        ? account.availableBalance 
        : 0;
      
      const totalBalance = typeof account.totalBalance === 'number' && !isNaN(account.totalBalance)
        ? account.totalBalance
        : 0;
      
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
    
    // Handle different response formats (direct array or {transactions: array})
    const transactionArray = Array.isArray(transactionsData) 
      ? transactionsData 
      : (transactionsData.transactions || []);
    
    return transactionArray.map((transaction: any) => {
      let type: 'DEPOSIT' | 'TRANSFER_IN' | 'TRANSFER_OUT' | 'WITHDRAWAL' | 'EXCHANGE' = 'DEPOSIT';
      let counterparty;
      
      // Determine transaction type
      if (transaction.transactionType === 'DEPOSIT') {
        type = 'DEPOSIT';
      } else if (transaction.transactionType === 'TRANSFER') {
        // Check if current user is source or destination
        if (walletData?.wallet?.customerId === transaction.sourceCustomerId) {
          type = 'TRANSFER_OUT';
          counterparty = transaction.destinationCustomerId;
        } else {
          type = 'TRANSFER_IN';
          counterparty = transaction.sourceCustomerId;
        }
      } else if (transaction.transactionType === 'WITHDRAWAL') {
        type = 'WITHDRAWAL';
      } else if (transaction.transactionType === 'EXCHANGE') {
        type = 'EXCHANGE';
      }
      
      return {
        id: transaction.id,
        type,
        amount: transaction.amount,
        currencyCode: transaction.currencyCode,
        timestamp: transaction.timestamp || transaction.createdDate || transaction.createdAt || new Date().toISOString(),
        status: transaction.status,
        counterparty,
        note: transaction.note,
        destinationCurrencyCode: transaction.destinationCurrencyCode,
        destinationAmount: transaction.destinationAmount
      };
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
