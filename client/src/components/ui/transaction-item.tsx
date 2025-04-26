import { 
  ArrowUpCircle, 
  ArrowDownCircle, 
  RefreshCcw, 
  ArrowDownRight, 
  ArrowUpRight 
} from "lucide-react";
import { useState, useMemo } from "react";
import { format } from "date-fns";

export interface TransactionItemProps {
  type: 'DEPOSIT' | 'TRANSFER_IN' | 'TRANSFER_OUT' | 'WITHDRAWAL' | 'EXCHANGE';
  amount: number;
  currencyCode: string;
  timestamp: string;
  status: string;
  counterparty?: string;
  note?: string;
  destCurrencyCode?: string;
  destAmount?: number;
}

export default function TransactionItem({
  type,
  amount,
  currencyCode,
  timestamp,
  status,
  counterparty,
  note,
  destCurrencyCode,
  destAmount
}: TransactionItemProps) {
  // Format date
  const date = useMemo(() => {
    try {
      return format(new Date(timestamp), 'MMMM dd, yyyy');
    } catch (e) {
      return timestamp || 'Unknown date';
    }
  }, [timestamp]);
  
  // Format amount - no division by 100 needed, amounts are already in dollars
  const formattedAmount = useMemo(() => {
    return new Intl.NumberFormat('en-US', {
      style: 'decimal',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  }, [amount]);
  
  // Format destination amount for exchange - no division by 100 needed
  const formattedDestAmount = useMemo(() => {
    if (!destAmount) return '';
    return new Intl.NumberFormat('en-US', {
      style: 'decimal',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(destAmount);
  }, [destAmount]);
  
  const getIcon = () => {
    switch (type) {
      case 'DEPOSIT':
        return (
          <div className="w-10 h-10 rounded-full bg-green-100 text-green-700 flex items-center justify-center mr-4">
            <ArrowDownCircle className="h-5 w-5" />
          </div>
        );
      case 'TRANSFER_IN':
        return (
          <div className="w-10 h-10 rounded-full bg-green-100 text-green-700 flex items-center justify-center mr-4">
            <ArrowDownRight className="h-5 w-5" />
          </div>
        );
      case 'TRANSFER_OUT':
        return (
          <div className="w-10 h-10 rounded-full bg-red-100 text-red-700 flex items-center justify-center mr-4">
            <ArrowUpRight className="h-5 w-5" />
          </div>
        );
      case 'WITHDRAWAL':
        return (
          <div className="w-10 h-10 rounded-full bg-red-100 text-red-700 flex items-center justify-center mr-4">
            <ArrowUpCircle className="h-5 w-5" />
          </div>
        );
      case 'EXCHANGE':
        return (
          <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center mr-4">
            <RefreshCcw className="h-5 w-5" />
          </div>
        );
      default:
        return (
          <div className="w-10 h-10 rounded-full bg-neutral-100 text-neutral-700 flex items-center justify-center mr-4">
            <RefreshCcw className="h-5 w-5" />
          </div>
        );
    }
  };
  
  const getTitle = () => {
    switch (type) {
      case 'DEPOSIT':
        return 'Deposit';
      case 'TRANSFER_IN':
        return counterparty ? `From: ${counterparty}` : 'Transfer Received';
      case 'TRANSFER_OUT':
        return counterparty ? `To: ${counterparty}` : 'Transfer Sent';
      case 'WITHDRAWAL':
        return 'Withdrawal';
      case 'EXCHANGE':
        return 'Currency Exchange';
      default:
        return 'Transaction';
    }
  };
  
  const getAmountDisplay = () => {
    switch (type) {
      case 'DEPOSIT':
      case 'TRANSFER_IN':
        return <p className="font-medium text-green-600 font-mono">+{currencyCode} {formattedAmount}</p>;
      case 'TRANSFER_OUT':
      case 'WITHDRAWAL':
        return <p className="font-medium text-red-600 font-mono">-{currencyCode} {formattedAmount}</p>;
      case 'EXCHANGE':
        return (
          <p className="font-medium text-blue-600 font-mono">
            {currencyCode} {formattedAmount} → {destCurrencyCode} {formattedDestAmount}
          </p>
        );
      default:
        return <p className="font-medium text-neutral-800 font-mono">{currencyCode} {formattedAmount}</p>;
    }
  };
  
  return (
    <div className="p-4 hover:bg-neutral-50 transition-colors">
      <div className="flex items-center">
        {getIcon()}
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-neutral-800">{getTitle()}</p>
              <p className="text-sm text-neutral-500">{date}</p>
              {note && <p className="text-xs text-neutral-500 mt-1">{note}</p>}
            </div>
            <div className="text-right">
              {getAmountDisplay()}
              <p className="text-xs text-neutral-500 capitalize">{status.toLowerCase()}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
