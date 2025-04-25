import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import CustomerLayout from "@/components/layouts/CustomerLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { usePaysafe } from "@/hooks/use-paysafe";
import TransactionItem from "@/components/ui/transaction-item";
import AddMoneyModal from "@/components/modals/AddMoneyModal";
import SendMoneyModal from "@/components/modals/SendMoneyModal";
import BulkTransferModal from "@/components/modals/BulkTransferModal";
import { RefreshCcw, Upload, Plus, Send, ArrowDownCircle } from "lucide-react";
import CurrencySelector from "@/components/ui/currency-selector";

export default function Transactions() {
  const { toast } = useToast();
  const [refreshing, setRefreshing] = useState(false);
  const [selectedCurrency, setSelectedCurrency] = useState<string>("USD");
  const [activeTab, setActiveTab] = useState<string>("all");
  const [addMoneyModalOpen, setAddMoneyModalOpen] = useState(false);
  const [sendMoneyModalOpen, setSendMoneyModalOpen] = useState(false);
  const [bulkTransferModalOpen, setBulkTransferModalOpen] = useState(false);
  
  const { 
    balances, 
    transactions, 
    cards,
    activeCurrencies,
    isLoadingWallet,
    isLoadingTransactions,
    refreshAllData
  } = usePaysafe();
  
  // Set initial currency based on balances
  useEffect(() => {
    if (balances?.length > 0) {
      setSelectedCurrency(balances[0].currencyCode);
    }
  }, [balances]);
  
  // Handle refresh
  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await refreshAllData();
      toast({
        title: "Refreshed",
        description: "Transaction data has been updated",
      });
    } catch (error) {
      toast({
        title: "Refresh failed",
        description: "Failed to update transaction data",
        variant: "destructive",
      });
    } finally {
      setRefreshing(false);
    }
  };
  
  // Filter transactions based on tab and currency
  const filterTransactions = () => {
    return transactions.filter(t => {
      // First filter by currency
      const matchesCurrency = t.currencyCode === selectedCurrency || 
        (t.type === 'EXCHANGE' && t.destinationCurrencyCode === selectedCurrency);
      
      if (!matchesCurrency) return false;
      
      // Then filter by transaction type
      switch (activeTab) {
        case 'deposits':
          return t.type === 'DEPOSIT';
        case 'transfers':
          return t.type === 'TRANSFER_IN' || t.type === 'TRANSFER_OUT';
        case 'withdrawals':
          return t.type === 'WITHDRAWAL';
        default:
          return true; // 'all' tab
      }
    });
  };
  
  const filteredTransactions = filterTransactions();
  
  return (
    <CustomerLayout
      title="Transactions"
      description="Manage your wallet transactions"
      showRefreshButton={true}
      onRefresh={handleRefresh}
    >
      {/* Currency Selector */}
      <CurrencySelector
        currencies={activeCurrencies}
        selectedCurrency={selectedCurrency}
        onSelect={setSelectedCurrency}
      />
      
      {/* Transaction Actions */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card className="bg-white shadow-sm hover:shadow transition-shadow">
          <CardContent className="p-4 flex flex-col items-center justify-center">
            <Button 
              variant="ghost" 
              className="w-full h-full flex flex-col py-4"
              onClick={() => setAddMoneyModalOpen(true)}
            >
              <Plus className="h-8 w-8 mb-2 text-green-600" />
              <span className="font-medium">Add Money</span>
            </Button>
          </CardContent>
        </Card>
        
        <Card className="bg-white shadow-sm hover:shadow transition-shadow">
          <CardContent className="p-4 flex flex-col items-center justify-center">
            <Button 
              variant="ghost" 
              className="w-full h-full flex flex-col py-4"
              onClick={() => setSendMoneyModalOpen(true)}
            >
              <Send className="h-8 w-8 mb-2 text-blue-600" />
              <span className="font-medium">Send Money</span>
            </Button>
          </CardContent>
        </Card>
        
        <Card className="bg-white shadow-sm hover:shadow transition-shadow">
          <CardContent className="p-4 flex flex-col items-center justify-center">
            <Button 
              variant="ghost" 
              className="w-full h-full flex flex-col py-4"
              onClick={() => {
                toast({ 
                  title: "Coming Soon", 
                  description: "Withdrawal functionality is coming soon" 
                })
              }}
            >
              <ArrowDownCircle className="h-8 w-8 mb-2 text-red-600" />
              <span className="font-medium">Withdraw</span>
            </Button>
          </CardContent>
        </Card>
        
        <Card className="bg-white shadow-sm hover:shadow transition-shadow">
          <CardContent className="p-4 flex flex-col items-center justify-center">
            <Button 
              variant="ghost" 
              className="w-full h-full flex flex-col py-4"
              onClick={() => setBulkTransferModalOpen(true)}
            >
              <Upload className="h-8 w-8 mb-2 text-purple-600" />
              <span className="font-medium">Bulk Transfer</span>
            </Button>
          </CardContent>
        </Card>
      </div>
      
      {/* Transactions Card */}
      <Card className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="p-4 md:p-6 border-b border-neutral-200">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-secondary">Transaction History</h2>
          </div>
          
          <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="deposits">Deposits</TabsTrigger>
              <TabsTrigger value="transfers">Transfers</TabsTrigger>
              <TabsTrigger value="withdrawals">Withdrawals</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
        
        {/* Transaction List */}
        <div className="divide-y divide-neutral-200">
          {isLoadingTransactions || refreshing ? (
            <div className="p-8 text-center">
              <RefreshCcw className="h-8 w-8 animate-spin text-primary mx-auto mb-2" />
              <p>Loading transactions...</p>
            </div>
          ) : filteredTransactions.length === 0 ? (
            <div className="p-8 text-center text-neutral-500">
              No {activeTab !== 'all' ? activeTab : ''} transactions found for {selectedCurrency}
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
    </CustomerLayout>
  );
}
