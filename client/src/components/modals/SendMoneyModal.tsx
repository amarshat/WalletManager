import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { User } from "lucide-react";

interface UserSearchResult {
  id: number;
  username: string;
  fullName: string;
}

interface SendMoneyModalProps {
  open: boolean;
  onClose: () => void;
  currencyCode: string;
}

export default function SendMoneyModal({
  open,
  onClose,
  currencyCode,
}: SendMoneyModalProps) {
  const { toast } = useToast();
  const [amount, setAmount] = useState("");
  const [recipientUsername, setRecipientUsername] = useState("");
  const [note, setNote] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<UserSearchResult[]>([]);
  const [showResults, setShowResults] = useState(false);

  const transferMutation = useMutation({
    mutationFn: async (data: {
      amount: number;
      currencyCode: string;
      recipientUsername: string;
      note?: string;
    }) => {
      const res = await apiRequest("POST", "/api/transactions/transfer", data);
      return await res.json();
    },
    onSuccess: () => {
      // Force a more thorough refresh of all wallet data with a delay
      setTimeout(() => {
        queryClient.invalidateQueries({ queryKey: ["/api/wallet"] });
        queryClient.invalidateQueries({ queryKey: ["/api/transactions"] });
      }, 500);
      
      // Get the amount as a dollar value for display
      const displayAmount = parseFloat(amount).toFixed(2);
      
      toast({
        title: "Transfer successful",
        description: `Sent ${currencyCode} ${displayAmount} to ${recipientUsername}`,
      });
      handleClose();
    },
    onError: (error) => {
      toast({
        title: "Transfer failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  useEffect(() => {
    const searchUsers = async () => {
      if (searchQuery.length < 2) {
        setSearchResults([]);
        return;
      }

      try {
        const response = await fetch(`/api/users/search?q=${encodeURIComponent(searchQuery)}`);
        const data = await response.json();
        setSearchResults(data);
      } catch (error) {
        console.error("Error searching users:", error);
      }
    };

    const timeoutId = setTimeout(searchUsers, 300);
    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

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
    
    if (!recipientUsername) {
      toast({
        title: "Recipient required",
        description: "Please select a recipient",
        variant: "destructive",
      });
      return;
    }
    
    // Convert dollars to cents for API
    const amountInCents = Math.round(parseFloat(amount) * 100);
    
    transferMutation.mutate({
      amount: amountInCents,
      currencyCode,
      recipientUsername,
      note,
    });
  };

  const handleSelectUser = (username: string) => {
    setRecipientUsername(username);
    setSearchQuery(username);
    setShowResults(false);
  };

  const handleClose = () => {
    setAmount("");
    setRecipientUsername("");
    setNote("");
    setSearchQuery("");
    setSearchResults([]);
    setShowResults(false);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Send Money</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="recipient">Recipient</Label>
            <div className="relative">
              <Input
                id="recipient"
                placeholder="Search by name or username"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setShowResults(true);
                  if (e.target.value !== recipientUsername) {
                    setRecipientUsername("");
                  }
                }}
                onFocus={() => setShowResults(true)}
              />
              
              {showResults && searchResults.length > 0 && (
                <div className="absolute z-10 w-full mt-1 bg-white border rounded-md shadow-lg">
                  {searchResults.map((user) => (
                    <div
                      key={user.id}
                      className="flex items-center p-2 hover:bg-neutral-100 cursor-pointer"
                      onClick={() => handleSelectUser(user.username)}
                    >
                      <div className="flex-shrink-0 w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center mr-2">
                        <User className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-sm font-medium">{user.fullName}</div>
                        <div className="text-xs text-neutral-500">@{user.username}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
          
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
            <Label htmlFor="note">Note (optional)</Label>
            <Input
              id="note"
              placeholder="Thanks for lunch!"
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
          </div>
          
          <DialogFooter className="flex justify-end gap-2 mt-4">
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={transferMutation.isPending || !recipientUsername}
            >
              {transferMutation.isPending ? "Processing..." : "Send Money"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
