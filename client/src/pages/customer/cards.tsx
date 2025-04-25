import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import CustomerLayout from "@/components/layouts/CustomerLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { usePaysafe } from "@/hooks/use-paysafe";
import { useToast } from "@/hooks/use-toast";
import AddCardModal from "@/components/modals/AddCardModal";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { CreditCard, Plus, Trash2 } from "lucide-react";

export default function Cards() {
  const { toast } = useToast();
  const [addCardModalOpen, setAddCardModalOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedCardId, setSelectedCardId] = useState<number | null>(null);
  
  const { cards, isLoadingCards, refreshCards } = usePaysafe();
  
  // Delete card mutation
  const deleteCardMutation = useMutation({
    mutationFn: async (cardId: number) => {
      const res = await apiRequest("DELETE", `/api/cards/${cardId}`);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/cards"] });
      toast({
        title: "Card deleted",
        description: "Your card has been removed successfully",
      });
      setDeleteDialogOpen(false);
    },
    onError: (error) => {
      toast({
        title: "Failed to delete card",
        description: error.message,
        variant: "destructive",
      });
    }
  });
  
  // Handle delete card confirmation
  const handleDeleteCard = () => {
    if (selectedCardId !== null) {
      deleteCardMutation.mutate(selectedCardId);
    }
  };
  
  // Open delete confirmation dialog
  const confirmDeleteCard = (cardId: number) => {
    setSelectedCardId(cardId);
    setDeleteDialogOpen(true);
  };
  
  // Get card network logo/icon
  const getCardIcon = (cardType: string) => {
    switch (cardType.toUpperCase()) {
      case 'VISA':
        return <div className="text-blue-600"><CreditCard className="h-6 w-6" /></div>;
      case 'MASTERCARD':
        return <div className="text-red-600"><CreditCard className="h-6 w-6" /></div>;
      case 'AMEX':
        return <div className="text-green-600"><CreditCard className="h-6 w-6" /></div>;
      case 'DISCOVER':
        return <div className="text-orange-600"><CreditCard className="h-6 w-6" /></div>;
      default:
        return <div className="text-gray-600"><CreditCard className="h-6 w-6" /></div>;
    }
  };
  
  return (
    <CustomerLayout
      title="Payment Cards"
      description="Manage your saved payment methods"
    >
      <Card className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="p-4 md:p-6 border-b border-neutral-200">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-secondary">Your Cards</h2>
            <Button 
              className="flex items-center"
              onClick={() => setAddCardModalOpen(true)}
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Card
            </Button>
          </div>
        </div>
        
        <CardContent>
          {isLoadingCards ? (
            <div className="p-8 text-center">Loading cards...</div>
          ) : !cards.length ? (
            <div className="p-8 text-center text-neutral-500">
              <CreditCard className="h-12 w-12 mx-auto mb-2 text-neutral-300" />
              <p>You don't have any cards saved yet.</p>
              <Button 
                className="mt-4"
                onClick={() => setAddCardModalOpen(true)}
              >
                Add Your First Card
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {cards.map((card) => (
                <div key={card.id} className="border border-neutral-200 rounded-lg p-4 hover:border-primary transition-colors">
                  <div className="flex items-center">
                    <div className="mr-3">
                      {getCardIcon(card.cardType)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-neutral-800">
                            {card.cardType} •••• {card.last4}
                          </p>
                          <p className="text-sm text-neutral-500">
                            Expires {card.expiryMonth}/{card.expiryYear}
                            {card.cardholderName && ` • ${card.cardholderName}`}
                          </p>
                        </div>
                        <div>
                          <Button 
                            variant="ghost" 
                            size="icon"
                            className="text-neutral-400 hover:text-error"
                            onClick={() => confirmDeleteCard(card.id)}
                          >
                            <Trash2 className="h-5 w-5" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Add Card Modal */}
      <AddCardModal
        open={addCardModalOpen}
        onClose={() => setAddCardModalOpen(false)}
      />
      
      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Card</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove this card? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setSelectedCardId(null)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteCard}
              className="bg-error hover:bg-error/90"
              disabled={deleteCardMutation.isPending}
            >
              {deleteCardMutation.isPending ? "Removing..." : "Remove Card"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </CustomerLayout>
  );
}
