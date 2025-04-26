import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { formatCurrency } from "@/lib/utils";
import { supportedCurrencies } from "@shared/schema";

interface WithdrawModalProps {
  open: boolean;
  onClose: () => void;
  currencyCode: string;
  maxAmount: number;
}

export default function WithdrawModal({ open, onClose, currencyCode, maxAmount }: WithdrawModalProps) {
  const { toast } = useToast();
  const [amount, setAmount] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [bankName, setBankName] = useState("");
  const [description, setDescription] = useState("");

  const currency = supportedCurrencies.find(c => c.code === currencyCode) || {
    code: currencyCode,
    symbol: "$",
    name: currencyCode
  };

  // Withdrawal mutation
  const withdrawMutation = useMutation({
    mutationFn: async (data: {
      amount: number;
      currencyCode: string;
      description?: string;
    }) => {
      const response = await apiRequest("POST", "/api/transactions/withdraw", data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Withdrawal initiated",
        description: `${formatCurrency(parseFloat(amount), currencyCode)} will be transferred to your bank account.`,
      });
      
      // Invalidate wallet and transaction data to refresh them
      queryClient.invalidateQueries({ queryKey: ["/api/wallet"] });
      queryClient.invalidateQueries({ queryKey: ["/api/transactions"] });
      
      handleClose();
    },
    onError: (error: any) => {
      toast({
        title: "Withdrawal failed",
        description: error.message || "Failed to complete withdrawal. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!amount || parseFloat(amount) <= 0) {
      toast({
        title: "Invalid amount",
        description: "Please enter a valid amount",
        variant: "destructive",
      });
      return;
    }
    
    if (parseFloat(amount) > maxAmount) {
      toast({
        title: "Insufficient funds",
        description: `Maximum withdrawable amount is ${formatCurrency(maxAmount, currencyCode)}`,
        variant: "destructive",
      });
      return;
    }
    
    if (!accountNumber || !bankName) {
      toast({
        title: "Missing bank details",
        description: "Please enter bank account information",
        variant: "destructive",
      });
      return;
    }
    
    // Parse amount as float
    const parsedAmount = parseFloat(amount);
    
    withdrawMutation.mutate({
      amount: parsedAmount,
      currencyCode,
      description: description || `Withdrawal to ${bankName}`,
    });
  };

  const handleClose = () => {
    setAmount("");
    setAccountNumber("");
    setBankName("");
    setDescription("");
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && handleClose()}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Withdraw Money</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="amount">Amount ({currencyCode})</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                {currency.symbol}
              </span>
              <Input
                id="amount"
                type="number"
                placeholder="0.00"
                step="0.01"
                min="0.01"
                max={maxAmount.toString()}
                className="pl-7"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
            </div>
            <p className="text-xs text-muted-foreground">
              Available balance: {currency.symbol}{maxAmount.toFixed(2)}
            </p>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="bankName">Bank Name</Label>
            <Input
              id="bankName"
              placeholder="Enter bank name"
              value={bankName}
              onChange={(e) => setBankName(e.target.value)}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="accountNumber">Account Number</Label>
            <Input
              id="accountNumber"
              placeholder="Enter account number"
              value={accountNumber}
              onChange={(e) => setAccountNumber(e.target.value)}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="description">Description (optional)</Label>
            <Input
              id="description"
              placeholder="Personal withdrawal"
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
              disabled={withdrawMutation.isPending}
            >
              {withdrawMutation.isPending ? "Processing..." : "Withdraw"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}