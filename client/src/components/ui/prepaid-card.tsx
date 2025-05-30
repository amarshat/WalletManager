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
import { CheckCircle, CreditCard, MoreVertical, Trash, Eye, Plus, Send, ArrowRightLeft, Copy } from "lucide-react";
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
  const { balances, transactions } = usePaysafe();
  
  // Find currency symbol
  const currency = supportedCurrencies.find(c => c.code === card.currencyCode);
  const symbol = currency?.symbol || '$';
  
  // Format expiry date
  const expiry = `${card.expiryMonth}/${card.expiryYear.slice(-2)}`;
  
  // Use wallet balance instead of card balance (since prepaid card balance = wallet balance)
  const walletBalance = balances?.find((b: any) => b.currencyCode === card.currencyCode);
  const actualBalance = walletBalance?.availableBalance || walletBalance?.balance || card.balance || 0;
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
          
          {/* Top Row: Paysafe Logo (left) + Tenant Logo (right) */}
          <div className="absolute top-4 left-4 right-4 flex justify-between items-start">
            {/* Paysafe Global Brand */}
            <div className="flex items-center">
              <div className="bg-white/90 backdrop-blur px-2 py-1 rounded text-xs font-bold text-slate-800">
                Paysafe
              </div>
            </div>
            
            {/* Tenant Logo */}
            {brand?.logo ? (
              <div className="flex items-center">
                <img 
                  src={brand.logo} 
                  alt={brand.name} 
                  className="h-6 max-w-[80px] object-contain filter brightness-0 invert"
                  onError={(e) => {
                    // Fallback to brand name if image fails to load
                    e.currentTarget.style.display = 'none';
                    e.currentTarget.nextSibling.style.display = 'block';
                  }}
                />
                <div className="bg-white/90 backdrop-blur px-2 py-1 rounded text-xs font-bold text-slate-800 hidden">
                  {brand.name}
                </div>
              </div>
            ) : brand?.name ? (
              <div className="flex items-center">
                <div className="bg-white/90 backdrop-blur px-2 py-1 rounded text-xs font-bold text-slate-800">
                  {brand.name}
                </div>
              </div>
            ) : null}
          </div>
          
          {/* Bottom Row: Cardholder Info (left) + Mastercard Logo (right) */}
          <div className="absolute bottom-4 left-4 right-4 flex justify-between items-end">
            {/* Cardholder Details */}
            <div className="text-white">
              <div className="flex items-center gap-2 mb-2">
                <div className="text-sm font-semibold tracking-wider">
                  {card.cardholderName || 'WALLET HOLDER'}
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0 text-white/70 hover:text-white hover:bg-white/10"
                  onClick={() => setShowDetails(true)}
                >
                  <Eye className="h-3 w-3" />
                </Button>
              </div>
              <div className="text-lg font-mono tracking-[0.2em] mb-2">
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
        
        {/* Quick Actions Panel - Horizontal Layout */}
        <div className="bg-white rounded-2xl shadow-lg mt-6 p-4">
          <div className="flex gap-3">
            <Button 
              variant="outline" 
              size="sm" 
              className="flex-1 flex items-center justify-center gap-2 h-12"
            >
              <Plus className="h-4 w-4" />
              <span className="text-sm">Add Money</span>
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              className="flex-1 flex items-center justify-center gap-2 h-12"
            >
              <Send className="h-4 w-4" />
              <span className="text-sm">Send</span>
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              className="flex-1 flex items-center justify-center gap-2 h-12"
            >
              <ArrowRightLeft className="h-4 w-4" />
              <span className="text-sm">Transfer</span>
            </Button>
          </div>
        </div>
        
        {/* Balance Panel */}
        <div className="bg-white rounded-2xl shadow-lg mt-4 p-6">
          <div className="text-center">
            <div className="text-sm text-muted-foreground mb-3">Available Balance</div>
            
            {/* Primary Currency Balance */}
            <div className="text-3xl font-bold text-primary mb-3">
              {symbol}{formattedBalance}
            </div>
            <div className="text-sm text-muted-foreground mb-4">{card.currencyCode}</div>
            
            {/* Other Currency Balances */}
            {balances && balances.length > 1 && (
              <div className="border-t pt-3">
                <div className="text-xs text-muted-foreground mb-2">Other Currencies</div>
                <div className="grid grid-cols-3 gap-2">
                  {balances
                    .filter((b: any) => b.currencyCode !== card.currencyCode)
                    .slice(0, 3)
                    .map((balance: any, index: number) => {
                      const currencySymbol = supportedCurrencies.find(c => c.code === balance.currencyCode)?.symbol || '';
                      const balanceAmount = balance.availableBalance || balance.balance || 0;
                      return (
                        <div key={index} className="text-center">
                          <div className="text-xs text-muted-foreground">{balance.currencyCode}</div>
                          <div className="text-sm font-semibold">
                            {currencySymbol}{balanceAmount.toLocaleString()}
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>
            )}
          </div>
        </div>
        
        {/* Transactions Panel */}
        <div className="bg-white rounded-2xl shadow-lg mt-4 p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-semibold">Recent Transactions</h3>
            <Button variant="ghost" size="sm">View All</Button>
          </div>
          <div className="space-y-3">
            {transactions && transactions.length > 0 ? (
              transactions.slice(0, 3).map((transaction: any, index: number) => {
                const isCredit = transaction.type === 'CREDIT' || transaction.amount > 0;
                const amount = Math.abs(transaction.amount);
                const formattedAmount = new Intl.NumberFormat('en-US', {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2
                }).format(amount);
                
                return (
                  <div key={index} className="flex justify-between items-center py-2">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        isCredit ? 'bg-green-100' : 'bg-red-100'
                      }`}>
                        {isCredit ? (
                          <Plus className={`h-4 w-4 ${isCredit ? 'text-green-600' : 'text-red-600'}`} />
                        ) : (
                          <Send className={`h-4 w-4 ${isCredit ? 'text-green-600' : 'text-red-600'}`} />
                        )}
                      </div>
                      <div>
                        <div className="text-sm font-medium">
                          {transaction.description || (isCredit ? 'Money Added' : 'Payment Sent')}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {transaction.createdAt ? new Date(transaction.createdAt).toLocaleDateString() : 'Recent'}
                        </div>
                      </div>
                    </div>
                    <div className={`text-sm font-semibold ${
                      isCredit ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {isCredit ? '+' : '-'}{symbol}{formattedAmount}
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-center py-4 text-muted-foreground">
                <div className="text-sm">No recent transactions</div>
                <div className="text-xs mt-1">Your transactions will appear here</div>
              </div>
            )}
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