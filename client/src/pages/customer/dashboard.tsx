import { useState, useEffect } from "react";
import CustomerLayout from "@/components/layouts/CustomerLayout";
import WalletCard from "@/components/ui/wallet-card";
import TransactionItem from "@/components/ui/transaction-item";
import CurrencySelector from "@/components/ui/currency-selector";
import { Card, CardContent } from "@/components/ui/card";
import { usePaysafe } from "@/hooks/use-paysafe";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { Separator } from "@/components/ui/separator";
import AddMoneyModal from "@/components/modals/AddMoneyModal";
import SendMoneyModal from "@/components/modals/SendMoneyModal";
import WithdrawModal from "@/components/modals/WithdrawModal";
import BulkTransferModal from "@/components/modals/BulkTransferModal";
import InitializeWalletCard from "@/components/wallet/InitializeWalletCard";
import { Button } from "@/components/ui/button";
import { ArrowDownIcon, Send, Upload } from "lucide-react";

export default function CustomerDashboard() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [selectedCurrency, setSelectedCurrency] = useState<string>(user?.defaultCurrency || "USD");
  const [refreshing, setRefreshing] = useState(false);
  const [addMoneyModalOpen, setAddMoneyModalOpen] = useState(false);
  const [sendMoneyModalOpen, setSendMoneyModalOpen] = useState(false);
  const [withdrawModalOpen, setWithdrawModalOpen] = useState(false);
  const [bulkTransferModalOpen, setBulkTransferModalOpen] = useState(false);
  
  const { 
    wallet,
    balances, 
    transactions, 
    cards,
    activeCurrencies,
    isLoadingWallet,
    isLoadingTransactions,
    walletError,
    refreshAllData
  } = usePaysafe();
  
  // Set initial currency based on user preference
  useEffect(() => {
    if (user?.defaultCurrency) {
      setSelectedCurrency(user.defaultCurrency);
    } else if (balances?.length > 0) {
      setSelectedCurrency(balances[0].currencyCode);
    }
  }, [user, balances]);
  
  // Get selected currency balance
  const selectedBalance = balances.find(balance => balance.currencyCode === selectedCurrency);
  
  // Debug the selected balance
  console.log('Selected balance from usePaysafe:', selectedBalance);
  
  const balanceAmount = selectedBalance ? selectedBalance.availableBalance : 0;
  
  // Debug final amount passed to WalletCard
  console.log('Final balance amount sent to WalletCard:', balanceAmount);
  
  // Handle refresh with explicit double refresh for better reliability
  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      // Do an initial refresh
      await refreshAllData();
      
      // Wait a moment and do a second refresh to ensure we have the latest data
      setTimeout(async () => {
        await refreshAllData();
        setRefreshing(false);
      }, 1000);
      
      toast({
        title: "Refreshed",
        description: "Your wallet data has been updated",
      });
    } catch (error) {
      toast({
        title: "Refresh failed",
        description: "Failed to update wallet data",
        variant: "destructive",
      });
      setRefreshing(false);
    }
  };
  
  // Filter transactions by selected currency
  const filteredTransactions = transactions.filter(transaction => 
    transaction.currencyCode === selectedCurrency || 
    (transaction.type === 'EXCHANGE' && transaction.destinationCurrencyCode === selectedCurrency)
  ).slice(0, 10); // Show only last 10
  
  // Check if wallet is created or needs initialization
  const isWalletMissing = !isLoadingWallet && (!wallet || walletError);
  
  return (
    <CustomerLayout showRefreshButton={true} onRefresh={handleRefresh}>
      {isWalletMissing ? (
        // Show wallet initialization card
        <div className="my-8">
          <InitializeWalletCard onSuccess={refreshAllData} />
        </div>
      ) : (
        <>
          {/* Currency Selector */}
          <CurrencySelector
            currencies={activeCurrencies}
            selectedCurrency={selectedCurrency}
            onSelect={setSelectedCurrency}
          />
          
          {/* Wallet Balance Card */}
          <WalletCard
            balance={balanceAmount}
            currencyCode={selectedCurrency}
            onAddMoney={() => setAddMoneyModalOpen(true)}
            onSendMoney={() => setSendMoneyModalOpen(true)}
            onWithdraw={() => setWithdrawModalOpen(true)}
            onRefresh={handleRefresh}
            loading={refreshing || isLoadingWallet}
          />
        </>
      )}
      
      {/* Bulk Transfer Action */}
      <div className="mt-4 flex justify-end">
        <Button 
          variant="outline" 
          className="flex items-center"
          onClick={() => setBulkTransferModalOpen(true)}
        >
          <Upload className="mr-2 h-4 w-4" />
          Bulk Transfer
        </Button>
      </div>
      
      {/* Recent Transactions Card */}
      <Card className="bg-white rounded-lg shadow-md overflow-hidden mt-6">
        <div className="p-4 md:p-6 border-b border-neutral-200">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-lg font-semibold text-gray-900">Recent Transactions</h2>
            <Button variant="link" className="text-primary hover:text-primary-dark text-sm font-medium">
              View All
            </Button>
          </div>
        </div>
        
        {/* Transaction List */}
        <div className="divide-y divide-neutral-200">
          {isLoadingTransactions ? (
            <div className="p-8 text-center">Loading transactions...</div>
          ) : filteredTransactions.length === 0 ? (
            <div className="p-8 text-center text-neutral-500">
              No transactions found for {selectedCurrency}
            </div>
          ) : (
            filteredTransactions.map((transaction) => (
              <TransactionItem
                key={transaction.id}
                type={transaction.type}
                amount={transaction.amount}
                currencyCode={transaction.currencyCode}
                timestamp={transaction.timestamp}
                status={transaction.status}
                counterparty={transaction.counterparty}
                note={transaction.note}
                destCurrencyCode={transaction.destinationCurrencyCode}
                destAmount={transaction.destinationAmount}
              />
            ))
          )}
        </div>
      </Card>
      
      {/* Modals */}
      <AddMoneyModal
        open={addMoneyModalOpen}
        onClose={() => setAddMoneyModalOpen(false)}
        currencyCode={selectedCurrency}
        cards={cards}
      />
      
      <SendMoneyModal
        open={sendMoneyModalOpen}
        onClose={() => setSendMoneyModalOpen(false)}
        currencyCode={selectedCurrency}
      />
      
      <BulkTransferModal
        open={bulkTransferModalOpen}
        onClose={() => setBulkTransferModalOpen(false)}
        currencyCode={selectedCurrency}
      />
      
      <WithdrawModal
        open={withdrawModalOpen}
        onClose={() => setWithdrawModalOpen(false)}
        currencyCode={selectedCurrency}
        maxAmount={balanceAmount}
      />
    </CustomerLayout>
  );
}