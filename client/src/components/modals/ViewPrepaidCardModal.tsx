import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { PrepaidCard } from "@/hooks/use-prepaid-cards";
import { CreditCard, Copy, Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import { formatCardNumber } from "@/lib/utils";
import { useBrand } from "@/hooks/use-brand";

interface ViewPrepaidCardModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  card: PrepaidCard | null;
}

export default function ViewPrepaidCardModal({
  open,
  onOpenChange,
  card,
}: ViewPrepaidCardModalProps) {
  const { brand } = useBrand();
  const [showCardNumber, setShowCardNumber] = useState(false);
  const [showCVV, setShowCVV] = useState(false);
  const brandName = brand?.name || "PaySage";

  if (!card) return null;

  // Format balance with 2 decimal places
  const formattedBalance = new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(card.balance);

  // Format expiry date
  const expiryDate = `${card.expiryMonth}/${card.expiryYear.slice(-2)}`;

  // Generate CVV - in a real app, this would come from the server
  // Here we're simulating it since it's using PhantomPay mock system
  // We're using a deterministic algorithm based on card info to be consistent
  const generateCVV = (): string => {
    // Create a string from the card number and expiry that will yield the same CVV each time
    const seedString = `${card.cardNumber}${card.expiryMonth}${card.expiryYear}`;
    // Simple hash function to get a number between 100-999
    let hash = 0;
    for (let i = 0; i < seedString.length; i++) {
      hash = ((hash << 5) - hash) + seedString.charCodeAt(i);
      hash = hash & hash; // Convert to 32bit integer
    }
    // Take absolute value, then mod by 900 and add 100 to ensure 3 digits
    const cvv = Math.abs(hash % 900 + 100);
    return cvv.toString();
  };

  const cvv = generateCVV();

  // Format card number for display with spaces
  const displayCardNumber = showCardNumber 
    ? formatCardNumber(card.cardNumber)
    : `•••• •••• •••• ${card.last4}`;

  // Format CVV for display
  const displayCVV = showCVV ? cvv : "•••";

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text).then(() => {
      alert(`${label} copied to clipboard!`);
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Card Details</DialogTitle>
          <DialogDescription>
            View your prepaid card details. Keep these details secure.
          </DialogDescription>
        </DialogHeader>

        <div className="p-4 bg-primary text-white rounded-md shadow-md relative overflow-hidden">
          <div className="absolute top-0 right-0 left-0 h-16 bg-gradient-to-r from-primary-600 to-primary-800 opacity-30"></div>
          
          <div className="flex justify-between items-start mb-8">
            <div className="flex items-center">
              <CreditCard className="h-8 w-8 mr-2" />
              <div>
                <p className="text-sm opacity-80">Issued by</p>
                <p className="font-semibold">{brandName}</p>
              </div>
            </div>
            <div className="flex flex-col items-end">
              <p className="text-sm opacity-80">Mastercard</p>
              <p className="font-semibold">{card.cardType}</p>
            </div>
          </div>

          <div className="mb-6">
            <p className="text-sm opacity-80">Card Number</p>
            <div className="flex items-center justify-between">
              <p className="font-mono text-lg">{displayCardNumber}</p>
              <div className="flex gap-1">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-6 w-6 bg-white/10 hover:bg-white/20"
                  onClick={() => setShowCardNumber(!showCardNumber)}
                >
                  {showCardNumber ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                </Button>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-6 w-6 bg-white/10 hover:bg-white/20"
                  onClick={() => copyToClipboard(card.cardNumber, "Card number")}
                >
                  <Copy className="h-3 w-3" />
                </Button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <p className="text-sm opacity-80">Cardholder</p>
              <p className="font-semibold truncate">{card.cardholderName}</p>
            </div>
            <div>
              <p className="text-sm opacity-80">Expiry</p>
              <p>{expiryDate}</p>
            </div>
            <div>
              <p className="text-sm opacity-80">CVV</p>
              <div className="flex items-center gap-1">
                <p>{displayCVV}</p>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-5 w-5 bg-white/10 hover:bg-white/20"
                  onClick={() => setShowCVV(!showCVV)}
                >
                  {showCVV ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-4 mt-4">
          <div className="border rounded-md p-4">
            <p className="text-sm text-muted-foreground">Available Balance</p>
            <p className="text-2xl font-bold">
              {card.currencyCode} {formattedBalance}
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              This is the amount available to spend on this card.
            </p>
          </div>

          <div className="border rounded-md p-4">
            <p className="text-sm text-muted-foreground">Status</p>
            <p className="font-semibold">{card.status || 'ACTIVE'}</p>
          </div>
        </div>

        <DialogFooter>
          <Button onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}