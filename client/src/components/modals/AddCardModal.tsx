import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface AddCardModalProps {
  open: boolean;
  onClose: () => void;
}

export default function AddCardModal({
  open,
  onClose,
}: AddCardModalProps) {
  const { toast } = useToast();
  const [cardNumber, setCardNumber] = useState("");
  const [cardholderName, setCardholderName] = useState("");
  const [expiryMonth, setExpiryMonth] = useState("");
  const [expiryYear, setExpiryYear] = useState("");
  
  const addCardMutation = useMutation({
    mutationFn: async (data: {
      cardType: string;
      last4: string;
      expiryMonth: string;
      expiryYear: string;
      cardholderName: string;
    }) => {
      const res = await apiRequest("POST", "/api/cards", data);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/cards"] });
      toast({
        title: "Card added successfully",
        description: "Your new card has been saved",
      });
      handleClose();
    },
    onError: (error) => {
      toast({
        title: "Failed to add card",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation
    if (cardNumber.length < 13 || cardNumber.length > 19) {
      toast({
        title: "Invalid card number",
        description: "Please enter a valid card number",
        variant: "destructive",
      });
      return;
    }
    
    // Determine card type based on first digit
    const firstDigit = cardNumber.charAt(0);
    let cardType = "UNKNOWN";
    
    if (cardNumber.startsWith('4')) {
      cardType = "VISA";
    } else if (cardNumber.startsWith('5')) {
      cardType = "MASTERCARD";
    } else if (cardNumber.startsWith('3')) {
      cardType = "AMEX";
    } else if (cardNumber.startsWith('6')) {
      cardType = "DISCOVER";
    }
    
    const last4 = cardNumber.slice(-4);
    
    addCardMutation.mutate({
      cardType,
      last4,
      expiryMonth,
      expiryYear,
      cardholderName,
    });
  };

  const handleClose = () => {
    setCardNumber("");
    setCardholderName("");
    setExpiryMonth("");
    setExpiryYear("");
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add New Card</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="cardNumber">Card Number</Label>
            <Input
              id="cardNumber"
              placeholder="1234 5678 9012 3456"
              value={cardNumber}
              onChange={(e) => setCardNumber(e.target.value.replace(/\D/g, ''))}
              required
              maxLength={19}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="cardholderName">Cardholder Name</Label>
            <Input
              id="cardholderName"
              placeholder="John Smith"
              value={cardholderName}
              onChange={(e) => setCardholderName(e.target.value)}
              required
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="expiryMonth">Expiry Month (MM)</Label>
              <Input
                id="expiryMonth"
                placeholder="MM"
                value={expiryMonth}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, '');
                  if (value === '' || (parseInt(value) >= 1 && parseInt(value) <= 12)) {
                    setExpiryMonth(value);
                  }
                }}
                required
                maxLength={2}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="expiryYear">Expiry Year (YY)</Label>
              <Input
                id="expiryYear"
                placeholder="YY"
                value={expiryYear}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, '');
                  setExpiryYear(value);
                }}
                required
                maxLength={2}
              />
            </div>
          </div>
          
          <DialogFooter className="flex justify-end gap-2 mt-4">
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={addCardMutation.isPending}
            >
              {addCardMutation.isPending ? "Saving..." : "Add Card"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
