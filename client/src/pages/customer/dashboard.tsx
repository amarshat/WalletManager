import { useState, useEffect } from "react";
import CustomerLayout from "@/components/layouts/CustomerLayout";
import WalletCard from "@/components/ui/wallet-card";
import TransactionItem from "@/components/ui/transaction-item";
import CurrencySelector from "@/components/ui/currency-selector";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { usePaysafe } from "@/hooks/use-paysafe";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { Separator } from "@/components/ui/separator";
import AddMoneyModal from "@/components/modals/AddMoneyModal";
import SendMoneyModal from "@/components/modals/SendMoneyModal";
import WithdrawModal from "@/components/modals/WithdrawModal";
import BulkTransferModal from "@/components/modals/BulkTransferModal";
import AddPrepaidCardModal from "@/components/modals/AddPrepaidCardModal";
import ActivateWalletFlow from "@/components/wallet/ActivateWalletFlow";
import { CarbonImpactSummary } from "@/components/wallet/CarbonImpactSummary";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { usePrepaidCards } from "@/hooks/use-prepaid-cards";
import { useCarbonContext } from "@/hooks/use-carbon-provider";
import PrepaidCard from "@/components/ui/prepaid-card";
import { 
  AlertCircle, 
  ArrowDownIcon,
  ArrowUpRight,
  BarChart3,
  Car, 
  CreditCard, 
  CalendarDays,
  DollarSign,
  Leaf, 
  MapPin,
  ParkingCircle,
  Plus, 
  Send, 
  TrendingUp,
  Upload,
  Users
} from "lucide-react";

export default function CustomerDashboard() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [selectedCurrency, setSelectedCurrency] = useState<string>(user?.defaultCurrency || "USD");
  const [refreshing, setRefreshing] = useState(false);
  const [addMoneyModalOpen, setAddMoneyModalOpen] = useState(false);
  const [sendMoneyModalOpen, setSendMoneyModalOpen] = useState(false);
  const [withdrawModalOpen, setWithdrawModalOpen] = useState(false);
  const [bulkTransferModalOpen, setBulkTransferModalOpen] = useState(false);
  const [addPrepaidCardModalOpen, setAddPrepaidCardModalOpen] = useState(false);
  
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
  
  const {
    prepaidCards,
    prepaidCardLimit,
    canAddMorePrepaidCards,
    isLoadingPrepaidCards,
    updatePrepaidCard,
    deletePrepaidCard,
    refetchPrepaidCards
  } = usePrepaidCards();
  
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
      await refetchPrepaidCards();
      
      // Wait a moment and do a second refresh to ensure we have the latest data
      setTimeout(async () => {
        await refreshAllData();
        await refetchPrepaidCards();
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
        // Show wallet activation and KYC flow
        <div className="my-8">
          <ActivateWalletFlow onSuccess={refreshAllData} />
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
      
      {/* Parking Spaces Summary Section */}
      {!isWalletMissing && (
        <div className="grid gap-6 grid-cols-1 lg:grid-cols-3 mt-6">
          {/* Parking Spaces Card */}
          <Card className="bg-white rounded-lg shadow-md overflow-hidden">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-semibold flex items-center">
                  <ParkingCircle className="mr-2 h-5 w-5 text-blue-600" />
                  My Parking Spaces
                </CardTitle>
                <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Active</Badge>
              </div>
              <CardDescription>Manage your parking locations</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Total spaces:</span>
                  <span className="text-xl font-bold">3</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Booked today:</span>
                  <span className="text-xl font-bold text-green-600">2</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Available:</span>
                  <span className="text-xl font-bold text-amber-500">1</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Occupancy rate:</span>
                  <span className="text-xl font-bold">67%</span>
                </div>
                <Progress value={67} className="h-2 mt-2" />
              </div>
            </CardContent>
            <CardFooter className="pt-0 border-t">
              <Button variant="ghost" className="w-full flex items-center justify-center text-blue-600" onClick={() => window.location.href = '/parking-spaces'}>
                <MapPin className="mr-2 h-4 w-4" />
                Manage Parking Spaces
              </Button>
            </CardFooter>
          </Card>

          {/* Earnings Card */}
          <Card className="bg-white rounded-lg shadow-md overflow-hidden">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-semibold flex items-center">
                  <DollarSign className="mr-2 h-5 w-5 text-green-600" />
                  Monthly Earnings
                </CardTitle>
                <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">April 2025</Badge>
              </div>
              <CardDescription>Your parking space revenue</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Current month:</span>
                  <span className="text-2xl font-bold">${balanceAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Previous month:</span>
                  <span className="text-xl font-medium">$982.50</span>
                </div>
                <div className="flex items-center text-green-600 font-medium">
                  <TrendingUp className="h-4 w-4 mr-1" />
                  <span>+12.4% from last month</span>
                </div>
                <div className="flex justify-between items-center pt-2">
                  <span className="text-sm font-medium">YTD Earnings:</span>
                  <span className="text-xl font-bold">$3,478.25</span>
                </div>
              </div>
            </CardContent>
            <CardFooter className="pt-0 border-t">
              <Button variant="ghost" className="w-full flex items-center justify-center text-green-600" onClick={() => window.location.href = '/transactions'}>
                <ArrowUpRight className="mr-2 h-4 w-4" />
                View Earnings Details
              </Button>
            </CardFooter>
          </Card>

          {/* Bookings Card */}
          <Card className="bg-white rounded-lg shadow-md overflow-hidden">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-semibold flex items-center">
                  <CalendarDays className="mr-2 h-5 w-5 text-purple-600" />
                  Upcoming Bookings
                </CardTitle>
                <Badge className="bg-purple-100 text-purple-800 hover:bg-purple-100">Today</Badge>
              </div>
              <CardDescription>Recent parking reservations</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="border rounded-md p-3">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center">
                      <Car className="h-4 w-4 mr-2 text-purple-600" />
                      <span className="font-medium">John D.</span>
                    </div>
                    <span className="text-sm">2:30 PM - 5:30 PM</span>
                  </div>
                  <div className="text-sm text-muted-foreground mt-1">Main Street Spot #2</div>
                </div>
                <div className="border rounded-md p-3">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center">
                      <Car className="h-4 w-4 mr-2 text-purple-600" />
                      <span className="font-medium">Maria L.</span>
                    </div>
                    <span className="text-sm">9:00 AM - 4:00 PM</span>
                  </div>
                  <div className="text-sm text-muted-foreground mt-1">Downtown Garage #1</div>
                </div>
                <div className="border rounded-md p-3">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center">
                      <Car className="h-4 w-4 mr-2 text-purple-600" />
                      <span className="font-medium">Alex T.</span>
                    </div>
                    <span className="text-sm">Tomorrow, 8:00 AM</span>
                  </div>
                  <div className="text-sm text-muted-foreground mt-1">Riverside Spot #3</div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="pt-0 border-t">
              <Button variant="ghost" className="w-full flex items-center justify-center text-purple-600" onClick={() => window.location.href = '/calendar'}>
                <CalendarDays className="mr-2 h-4 w-4" />
                View Calendar
              </Button>
            </CardFooter>
          </Card>
        </div>
      )}
      
      {/* Green Parking Impact Card */}
      {!isWalletMissing && (
        <Card className="bg-white rounded-lg shadow-md overflow-hidden mt-6">
          <div className="p-4 md:p-6 border-b border-neutral-200">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                <Leaf className="h-5 w-5 mr-2 text-green-600" />
                Green Parking Impact
              </h2>
              <Button 
                variant="link" 
                className="text-primary hover:text-primary-dark text-sm font-medium"
                onClick={() => window.location.href = '/carbon-impact'}
              >
                View Details
              </Button>
            </div>
            <p className="text-sm text-muted-foreground">
              By sharing your parking spaces, you help reduce urban congestion and carbon emissions
            </p>
          </div>
          <div className="p-4 md:p-6">
            <CarbonImpactSummary />
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-green-50 p-3 rounded-lg">
                  <div className="text-green-700 font-medium">Emissions Reduced</div>
                  <div className="text-2xl font-bold text-green-800 mt-1">178 kg</div>
                  <div className="text-xs text-green-600 mt-1">Carbon dioxide equivalent</div>
                </div>
                <div className="bg-blue-50 p-3 rounded-lg">
                  <div className="text-blue-700 font-medium">Parking Hours Shared</div>
                  <div className="text-2xl font-bold text-blue-800 mt-1">124 hrs</div>
                  <div className="text-xs text-blue-600 mt-1">Last 30 days</div>
                </div>
                <div className="bg-purple-50 p-3 rounded-lg">
                  <div className="text-purple-700 font-medium">Trees Equivalent</div>
                  <div className="text-2xl font-bold text-purple-800 mt-1">8 trees</div>
                  <div className="text-xs text-purple-600 mt-1">Carbon sequestration</div>
                </div>
              </div>
            </div>
          </div>
        </Card>
      )}
      
      {/* Recent Earnings Card */}
      <Card className="bg-white rounded-lg shadow-md overflow-hidden mt-6">
        <div className="p-4 md:p-6 border-b border-neutral-200">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center">
              <DollarSign className="h-5 w-5 mr-2 text-green-600" />
              Recent Parking Earnings
            </h2>
            <Button variant="link" className="text-primary hover:text-primary-dark text-sm font-medium" onClick={() => window.location.href = '/transactions'}>
              View All Earnings
            </Button>
          </div>
          <p className="text-sm text-muted-foreground">
            Revenue from your parking spaces and payouts to your bank account
          </p>
        </div>
        
        {/* Transaction List */}
        <div className="divide-y divide-neutral-200">
          {isLoadingTransactions ? (
            <div className="p-8 text-center">Loading earnings data...</div>
          ) : filteredTransactions.length === 0 ? (
            <div className="p-8 text-center text-neutral-500">
              No earnings found for {selectedCurrency}
            </div>
          ) : (
            <div>
              {filteredTransactions.map((transaction) => (
                <div key={transaction.id} className="p-4 hover:bg-gray-50">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center">
                      {transaction.type === 'DEPOSIT' || transaction.type === 'TRANSFER_IN' ? (
                        <div className="bg-green-100 p-2 rounded-full mr-3">
                          <ArrowDownIcon className="h-4 w-4 text-green-600" />
                        </div>
                      ) : (
                        <div className="bg-blue-100 p-2 rounded-full mr-3">
                          <ArrowUpRight className="h-4 w-4 text-blue-600" />
                        </div>
                      )}
                      <div>
                        <div className="font-medium">
                          {transaction.type === 'DEPOSIT' ? 'Parking Earnings' : 
                           transaction.type === 'TRANSFER_IN' ? 'Payment Received' :
                           transaction.type === 'WITHDRAWAL' ? 'Withdrawal to Bank' : 
                           transaction.type === 'TRANSFER_OUT' ? 'Transfer Sent' : 
                           transaction.type}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {transaction.note || (
                            transaction.type === 'DEPOSIT' ? 'BingGo booking payment' : 
                            transaction.type === 'WITHDRAWAL' ? 'Funds to connected bank account' : 
                            transaction.counterparty || 'Transaction'
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`font-medium ${
                        transaction.type === 'DEPOSIT' || transaction.type === 'TRANSFER_IN' ? 
                        'text-green-600' : 'text-blue-600'
                      }`}>
                        {transaction.type === 'DEPOSIT' || transaction.type === 'TRANSFER_IN' ? '+' : '-'}
                        ${Math.abs(transaction.amount).toFixed(2)}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {new Date(transaction.timestamp).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              
              <div className="p-4 text-center border-t">
                <Button variant="outline" size="sm" onClick={() => window.location.href = '/transactions'}>
                  View All Earnings History
                </Button>
              </div>
            </div>
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
      
      <AddPrepaidCardModal
        open={addPrepaidCardModalOpen}
        onOpenChange={setAddPrepaidCardModalOpen}
      />
    </CustomerLayout>
  );
}