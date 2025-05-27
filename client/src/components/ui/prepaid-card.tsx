import { useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { PrepaidCard as PrepaidCardType } from "@/hooks/use-prepaid-cards";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { CheckCircle, CreditCard, MoreVertical, Trash, Eye, Plus, Send, ArrowRightLeft } from "lucide-react";
import { supportedCurrencies } from "@shared/schema";
import ViewPrepaidCardModal from "@/components/modals/ViewPrepaidCardModal";
import { useBrand } from "@/hooks/use-brand";
import { usePaysafe } from "@/hooks/use-paysafe";

interface PrepaidCardProps {
  card: PrepaidCardType;
  onSetDefault: (id: number) => void;
  onDelete: (id: number) => void;
}

export default function PrepaidCard({ card, onSetDefault, onDelete }: PrepaidCardProps) {
  const [showDetails, setShowDetails] = useState(false);
  const { brand } = useBrand();
  const { balances } = usePaysafe();
  
  // Find currency symbol
  const currency = supportedCurrencies.find(c => c.code === card.currencyCode);
  const symbol = currency?.symbol || '$';
  
  // Format expiry date
  const expiry = `${card.expiryMonth}/${card.expiryYear.slice(-2)}`;
  
  // Use wallet balance instead of card balance (since prepaid card balance = wallet balance)
  const walletBalance = balances?.find(b => b.currencyCode === card.currencyCode)?.balance || 0;
  const actualBalance = walletBalance || card.balance;
  const formattedBalance = new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(actualBalance);
  
  // Format card number for display
  const maskedCardNumber = `•••• •••• •••• ${card.last4}`;
  
  return (
    <>
      {/* Physical Card Design */}
      <div className="relative w-full max-w-md mx-auto">
        {/* Card Container with realistic proportions (3.375 x 2.125 inch ratio) */}
        <div className={cn(
          "relative w-full aspect-[16/10] rounded-2xl shadow-2xl overflow-hidden",
          "bg-gradient-to-br from-slate-800 via-slate-700 to-slate-900",
          "transform transition-all duration-300 hover:scale-105 hover:shadow-3xl",
          "border border-slate-600"
        )}>
          {/* Card Background Pattern */}
          <div className="absolute inset-0 bg-gradient-to-br from-transparent via-slate-600/20 to-transparent"></div>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.1),transparent_50%)]"></div>
          
          {/* Top Row: Global Brand Logo (left) + Tenant Logo (right) */}
          <div className="absolute top-4 left-4 right-4 flex justify-between items-start">
            {/* Global Brand Logo (Paysafe) */}
            <div className="flex items-center">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white text-xs font-bold">P</span>
              </div>
            </div>
            
            {/* Tenant Logo */}
            {brand?.logo && (
              <div className="flex items-center">
                <img 
                  src={brand.logo} 
                  alt={brand.name} 
                  className="h-6 max-w-[80px] object-contain filter brightness-0 invert"
                />
              </div>
            )}
          </div>
          
          {/* Bottom Row: Cardholder Info (left) + Mastercard Logo (right) */}
          <div className="absolute bottom-4 left-4 right-4 flex justify-between items-end">
            {/* Cardholder Details */}
            <div className="text-white">
              <div className="text-xs opacity-75 mb-1">CARDHOLDER</div>
              <div className="text-sm font-semibold tracking-wider">
                {card.cardholderName || 'WALLET HOLDER'}
              </div>
              <div className="text-lg font-mono tracking-[0.2em] mt-2 mb-2">
                {maskedCardNumber}
              </div>
              <div className="flex gap-4 text-xs">
                <div>
                  <div className="opacity-75">EXPIRES</div>
                  <div className="font-mono">{expiry}</div>
                </div>
                <div>
                  <div className="opacity-75">CVV</div>
                  <div className="font-mono">•••</div>
                </div>
              </div>
            </div>
            
            {/* Mastercard Logo */}
            <div className="flex-shrink-0">
              <img 
                src="/mastercard-logo.png" 
                alt="Mastercard" 
                className="h-8 w-auto object-contain"
              />
            </div>
          </div>
        </div>
        
        {/* Quick Actions Panel */}
        <div className="bg-white rounded-2xl shadow-lg mt-6 p-4">
          <div className="grid grid-cols-3 gap-3">
            <Button 
              variant="outline" 
              size="sm" 
              className="flex flex-col items-center gap-2 h-16"
            >
              <Plus className="h-5 w-5" />
              <span className="text-xs">Add Money</span>
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              className="flex flex-col items-center gap-2 h-16"
            >
              <Send className="h-5 w-5" />
              <span className="text-xs">Send</span>
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              className="flex flex-col items-center gap-2 h-16"
            >
              <ArrowRightLeft className="h-5 w-5" />
              <span className="text-xs">Transfer</span>
            </Button>
          </div>
        </div>
        
        {/* Balance Panel */}
        <div className="bg-white rounded-2xl shadow-lg mt-4 p-6">
          <div className="text-center">
            <div className="text-sm text-muted-foreground mb-2">Available Balance</div>
            <div className="text-3xl font-bold text-primary">
              {symbol}{formattedBalance}
            </div>
            <div className="text-sm text-muted-foreground mt-1">{card.currencyCode}</div>
          </div>
        </div>
        
        {/* Transactions Panel */}
        <div className="bg-white rounded-2xl shadow-lg mt-4 p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-semibold">Recent Transactions</h3>
            <Button variant="ghost" size="sm">View All</Button>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between items-center py-2">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                  <Plus className="h-4 w-4 text-green-600" />
                </div>
                <div>
                  <div className="text-sm font-medium">Money Added</div>
                  <div className="text-xs text-muted-foreground">Today</div>
                </div>
              </div>
              <div className="text-sm font-semibold text-green-600">+{symbol}100.00</div>
            </div>
            <div className="flex justify-between items-center py-2">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <Send className="h-4 w-4 text-blue-600" />
                </div>
                <div>
                  <div className="text-sm font-medium">Transfer Sent</div>
                  <div className="text-xs text-muted-foreground">Yesterday</div>
                </div>
              </div>
              <div className="text-sm font-semibold text-red-600">-{symbol}25.50</div>
            </div>
          </div>
        </div>
      </div>
      
      <ViewPrepaidCardModal 
        open={showDetails} 
        onOpenChange={setShowDetails} 
        card={card}
      />
    </>
  );
}