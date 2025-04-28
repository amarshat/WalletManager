import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';

export interface PrepaidCard {
  id: number;
  userId: number;
  cardType: string;
  cardNumber: string;
  last4: string;
  expiryMonth: string;
  expiryYear: string;
  cardholderName: string | null;
  isDefault: boolean | null;
  balance: number;
  currencyCode: string;
  cardDesign?: string;
  status?: string;
}

export interface PrepaidCardResponse {
  cards: PrepaidCard[];
  limit: number;
  canAddMore: boolean;
}

export function usePrepaidCards() {
  const { toast } = useToast();
  const { user } = useAuth();
  
  // Query to fetch prepaid cards
  const {
    data: prepaidCardData,
    isLoading: isLoadingPrepaidCards,
    error: prepaidCardsError,
    refetch: refetchPrepaidCards
  } = useQuery<PrepaidCardResponse>({
    queryKey: ['/api/prepaid-cards'],
    enabled: !!user
  });
  
  // Add a new prepaid card
  const addPrepaidCardMutation = useMutation({
    mutationFn: async (cardData: Partial<PrepaidCard> & { balance: string }) => {
      const response = await apiRequest('POST', '/api/prepaid-cards', cardData);
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/prepaid-cards'] });
      toast({
        title: 'Success',
        description: 'Prepaid card added successfully',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: `Failed to add prepaid card: ${error.message}`,
        variant: 'destructive',
      });
    },
  });
  
  // Update a prepaid card
  const updatePrepaidCardMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<PrepaidCard> }) => {
      const response = await apiRequest('PUT', `/api/prepaid-cards/${id}`, data);
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/prepaid-cards'] });
      toast({
        title: 'Success',
        description: 'Prepaid card updated successfully',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: `Failed to update prepaid card: ${error.message}`,
        variant: 'destructive',
      });
    },
  });
  
  // Delete a prepaid card
  const deletePrepaidCardMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await apiRequest('DELETE', `/api/prepaid-cards/${id}`);
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/prepaid-cards'] });
      toast({
        title: 'Success',
        description: 'Prepaid card deleted successfully',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: `Failed to delete prepaid card: ${error.message}`,
        variant: 'destructive',
      });
    },
  });
  
  return {
    prepaidCards: prepaidCardData?.cards || [],
    prepaidCardLimit: prepaidCardData?.limit || 3,
    canAddMorePrepaidCards: prepaidCardData?.canAddMore || false,
    isLoadingPrepaidCards,
    prepaidCardsError,
    refetchPrepaidCards,
    addPrepaidCard: addPrepaidCardMutation.mutate,
    isAddingPrepaidCard: addPrepaidCardMutation.isPending,
    updatePrepaidCard: updatePrepaidCardMutation.mutate,
    isUpdatingPrepaidCard: updatePrepaidCardMutation.isPending,
    deletePrepaidCard: deletePrepaidCardMutation.mutate,
    isDeletingPrepaidCard: deletePrepaidCardMutation.isPending
  };
}