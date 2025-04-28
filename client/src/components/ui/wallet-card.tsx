import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { 
  BanknoteIcon,
  CreditCard, 
  DollarSign,
  RefreshCw, 
  ArrowDownCircle,
  PiggyBank,
  Building,
  ParkingCircle,
  Plus,
  Send,
  PocketKnife
} from "lucide-react";
import { useMemo } from "react";
import { supportedCurrencies } from "@shared/schema";

export interface WalletCardProps {
  balance: number;
  currencyCode: string;
  onAddMoney: () => void;
  onSendMoney: () => void;
  onWithdraw: () => void;
  onRefresh: () => void;
  loading?: boolean;
}

export default function WalletCard({ 
  balance, 
  currencyCode, 
  onAddMoney, 
  onSendMoney, 
  onWithdraw, 
  onRefresh,
  loading = false
}: WalletCardProps) {
  const currency = useMemo(() => {
    return supportedCurrencies.find(c => c.code === currencyCode) || { code: currencyCode, symbol: '$', name: currencyCode };
  }, [currencyCode]);
  
  const formattedBalance = useMemo(() => {
    // Handle undefined, null, or NaN balance values
    const safeBalance = (balance !== undefined && balance !== null && !isNaN(balance)) 
      ? balance // No need to divide by 100, amount is already in dollars
      : 0;
      
    return new Intl.NumberFormat('en-US', {
      style: 'decimal',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(safeBalance);
  }, [balance]);
  
  return (
    <Card className="overflow-hidden shadow-md wallet-card transition-transform hover:translate-y-[-2px]">
      <div className="bg-primary text-white p-4 md:p-6">
        <div className="flex items-center justify-between mb-1">
          <h2 className="text-sm font-medium opacity-90">Partner Earnings</h2>
          <Button 
            variant="ghost" 
            size="icon" 
            className="opacity-80 hover:opacity-100 text-white" 
            onClick={onRefresh}
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
        <div className="flex items-baseline">
          <span className="text-3xl font-bold font-mono">{currency.symbol}{formattedBalance}</span>
          <span className="ml-2 text-sm opacity-80">{currencyCode}</span>
        </div>
        
        <div className="mt-4 pt-4 border-t border-white border-opacity-20 grid grid-cols-3 gap-2">
          <Button 
            variant="ghost" 
            className="flex flex-col items-center bg-white bg-opacity-10 rounded-lg py-2 px-1 hover:bg-opacity-20 h-auto"
            onClick={onAddMoney}
          >
            <ParkingCircle className="h-5 w-5 mb-1" />
            <span className="text-xs">Add Space</span>
          </Button>
          
          <Button 
            variant="ghost" 
            className="flex flex-col items-center bg-white bg-opacity-10 rounded-lg py-2 px-1 hover:bg-opacity-20 h-auto"
            onClick={onSendMoney}
          >
            <CreditCard className="h-5 w-5 mb-1" />
            <span className="text-xs">Transfer Funds</span>
          </Button>
          
          <Button 
            variant="ghost" 
            className="flex flex-col items-center bg-white bg-opacity-10 rounded-lg py-2 px-1 hover:bg-opacity-20 h-auto"
            onClick={onWithdraw}
          >
            <BanknoteIcon className="h-5 w-5 mb-1" />
            <span className="text-xs">Withdraw</span>
          </Button>
        </div>
      </div>
    </Card>
  );
}
