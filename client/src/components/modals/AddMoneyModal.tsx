import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Card } from "@shared/schema";

interface AddMoneyModalProps {
  open: boolean;
  onClose: () => void;
  currencyCode: string;
  cards: Card[];
}

export default function AddMoneyModal({
  open,
  onClose,
  currencyCode,
  cards,
}: AddMoneyModalProps) {
  const { toast } = useToast();
  const [amount, setAmount] = useState("");
  const [card, setCard] = useState(cards.length > 0 ? `${cards[0].id}` : "");
  const [description, setDescription] = useState("");

  const depositMutation = useMutation({
    mutationFn: async (data: { amount: number; currencyCode: string; description?: string }) => {
      const res = await apiRequest("POST", "/api/transactions/deposit", data);
      return await res.json();
    },
    onSuccess: (data) => {
      // Force a more thorough refresh of all wallet data
      setTimeout(() => {
        queryClient.invalidateQueries({ queryKey: ["/api/wallet"] });
        queryClient.invalidateQueries({ queryKey: ["/api/transactions"] });
      }, 500);
      
      // Get the amount as a dollar value for display
      const displayAmount = (parseFloat(amount)).toFixed(2);
      
      toast({
        title: "Deposit successful",
        description: `Added ${currencyCode} ${displayAmount} to your wallet`,
      });
      handleClose();
    },
    onError: (error) => {
      toast({
        title: "Deposit failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!amount || parseInt(amount) <= 0) {
      toast({
        title: "Invalid amount",
        description: "Please enter a valid amount",
        variant: "destructive",
      });
      return;
    }
    
    // Parse amount but don't convert to cents
    const parsedAmount = parseFloat(amount);
    
    depositMutation.mutate({
      amount: parsedAmount,
      currencyCode,
      description,
    });
  };

  const handleClose = () => {
    setAmount("");
    setCard(cards.length > 0 ? `${cards[0].id}` : "");
    setDescription("");
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add Money</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="amount">Amount</Label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <span className="text-neutral-500">{currencyCode}</span>
              </div>
              <Input
                id="amount"
                type="number"
                step="0.01"
                min="0.01"
                placeholder="0.00"
                className="pl-12"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="card">Card</Label>
            <Select value={card} onValueChange={setCard}>
              <SelectTrigger>
                <SelectValue placeholder="Select a card" />
              </SelectTrigger>
              <SelectContent>
                {cards.map((card) => (
                  <SelectItem key={card.id} value={`${card.id}`}>
                    {card.cardType} •••• {card.last4}
                  </SelectItem>
                ))}
                {cards.length === 0 && (
                  <SelectItem value="new">+ Add new card</SelectItem>
                )}
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="description">Description (optional)</Label>
            <Input
              id="description"
              placeholder="Personal deposit"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
          
          <DialogFooter className="flex justify-end gap-2 mt-4">
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={depositMutation.isPending}
            >
              {depositMutation.isPending ? "Processing..." : "Add Money"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
