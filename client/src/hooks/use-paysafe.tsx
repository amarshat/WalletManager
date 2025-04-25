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
    if (!walletData?.balances?.accounts) return [];
    
    return walletData.balances.accounts.map((account: any) => ({
      currencyCode: account.currencyCode,
      availableBalance: account.availableBalance,
      totalBalance: account.totalBalance,
      currencySymbol: supportedCurrencies.find(c => c.code === account.currencyCode)?.symbol || '$'
    }));
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
    
    return transactionsData.map((transaction: any) => {
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
        timestamp: transaction.timestamp || transaction.createdDate,
        status: transaction.status,
        counterparty,
        note: transaction.note,
        destinationCurrencyCode: transaction.destinationCurrencyCode,
        destinationAmount: transaction.destinationAmount
      };
    });
  }, [transactionsData, walletData]);
  
  // Refresh all wallet data
  const refreshAllData = () => {
    refetchWallet();
    refetchTransactions();
    refetchCards();
  };
  
  return {
    wallet: walletData?.wallet,
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
