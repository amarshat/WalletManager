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
import { useWallet } from "@/hooks/use-wallet";

interface PrepaidCardProps {
  card: PrepaidCardType;
  onSetDefault: (id: number) => void;
  onDelete: (id: number) => void;
}

export default function PrepaidCard({ card, onSetDefault, onDelete }: PrepaidCardProps) {
  const [showDetails, setShowDetails] = useState(false);
  
  // Find currency symbol
  const currency = supportedCurrencies.find(c => c.code === card.currencyCode);
  const symbol = currency?.symbol || '$';
  
  // Format expiry date
  const expiry = `${card.expiryMonth}/${card.expiryYear.slice(-2)}`;
  
  // Format balance with 2 decimal places
  const formattedBalance = new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(card.balance);
  
  return (
    <>
      <Card className={cn(
        "relative overflow-hidden transition-all duration-300",
        card.isDefault ? "border-primary" : "border-border"
      )}>
        {card.isDefault && (
          <Badge className="absolute top-2 right-2 bg-primary text-white">
            Default
          </Badge>
        )}
        
        <CardContent className="p-6 flex flex-col h-full">
          <div className="flex justify-between items-start mb-4">
            <div className="flex items-center">
              <CreditCard className="h-6 w-6 mr-2 text-primary" />
              <span className="font-semibold">Prepaid Mastercard</span>
            </div>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setShowDetails(true)}>
                  <Eye className="h-4 w-4 mr-2" />
                  View card details
                </DropdownMenuItem>
                
                {!card.isDefault && (
                  <DropdownMenuItem onClick={() => onSetDefault(card.id)}>
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Set as default
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => onDelete(card.id)}
                  className="text-destructive focus:text-destructive"
                >
                  <Trash className="h-4 w-4 mr-2" />
                  Delete card
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          
          <div className="grid grid-cols-1 gap-4 mb-4">
            <div>
              <p className="text-sm text-muted-foreground">Card Number</p>
              <p className="font-mono">•••• •••• •••• {card.last4}</p>
            </div>
            
            <div className="flex justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Expiry</p>
                <p>{expiry}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Status</p>
                <Badge variant={card.status === 'ACTIVE' ? 'success' : 'secondary'}>
                  {card.status || 'ACTIVE'}
                </Badge>
              </div>
            </div>
          </div>
          
          <div className="mt-auto">
            <p className="text-sm text-muted-foreground">Balance</p>
            <p className="text-2xl font-bold">
              {symbol}{formattedBalance} <span className="text-sm">{card.currencyCode}</span>
            </p>
          </div>
          
          <Button 
            variant="outline" 
            size="sm" 
            className="w-full mt-4"
            onClick={() => setShowDetails(true)}
          >
            <Eye className="h-4 w-4 mr-2" />
            View Card Details
          </Button>
        </CardContent>
      </Card>
      
      <ViewPrepaidCardModal 
        open={showDetails} 
        onOpenChange={setShowDetails} 
        card={card}
      />
    </>
  );
}