import { useQuery, useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";

// Define types for carbon data
export interface CarbonCategory {
  id: number;
  category: string;
  averageFootprint: number;
}

export interface CarbonPreference {
  id: number;
  userId: number;
  trackingEnabled: boolean;
  offsetEnabled: boolean;
  offsetPercentage: number;
}

export interface CarbonImpact {
  id: number;
  userId: number;
  amount: number;
  category: string;
  description: string;
  date: string;
  transactionId?: string;
}

export interface CarbonOffset {
  id: number;
  userId: number;
  amount: number;
  projectName: string;
  description: string;
  date: string;
}

export interface CarbonSummary {
  totalImpact: number;
  totalOffset: number;
  netImpact: number;
  impactByCategory: Record<string, number>;
  monthlyAverage: number;
}

// Hook for carbon impact data and operations
export function useCarbon(days = 30) {
  const { toast } = useToast();

  // Fetch carbon categories
  const { 
    data: carbonCategories = [],
    isLoading: isLoadingCategories
  } = useQuery<CarbonCategory[]>({
    queryKey: ['/api/carbon/categories'],
  });

  // Fetch carbon preferences
  const { 
    data: carbonPreferences,
    isLoading: isLoadingPreferences
  } = useQuery<CarbonPreference>({
    queryKey: ['/api/carbon/preferences'],
  });

  // Fetch carbon impacts
  const { 
    data: carbonImpacts = [],
    isLoading: isLoadingImpacts
  } = useQuery<CarbonImpact[]>({
    queryKey: ['/api/carbon/impacts'],
  });

  // Fetch carbon offsets
  const { 
    data: carbonOffsets = [],
    isLoading: isLoadingOffsets
  } = useQuery<CarbonOffset[]>({
    queryKey: ['/api/carbon/offsets'],
  });

  // Fetch carbon summary
  const { 
    data: carbonSummary,
    isLoading: isLoadingSummary
  } = useQuery<CarbonSummary>({
    queryKey: ['/api/carbon/summary', days],
    queryFn: async () => {
      const res = await apiRequest('GET', `/api/carbon/summary?days=${days}`);
      return await res.json();
    }
  });

  // Update carbon preferences
  const updateCarbonPreferencesMutation = useMutation({
    mutationFn: async (data: Partial<CarbonPreference>) => {
      const res = await apiRequest('PATCH', '/api/carbon/preferences', data);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/carbon/preferences'] });
      toast({
        title: "Preferences updated",
        description: "Your carbon impact preferences have been updated",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error updating preferences",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Record carbon impact
  const recordCarbonImpactMutation = useMutation({
    mutationFn: async (data: Omit<CarbonImpact, 'id' | 'userId'>) => {
      const res = await apiRequest('POST', '/api/carbon/impacts', data);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/carbon/impacts'] });
      queryClient.invalidateQueries({ queryKey: ['/api/carbon/summary'] });
      toast({
        title: "Impact recorded",
        description: "A new carbon impact has been recorded",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error recording impact",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Record carbon offset
  const recordCarbonOffsetMutation = useMutation({
    mutationFn: async (data: Omit<CarbonOffset, 'id' | 'userId'>) => {
      const res = await apiRequest('POST', '/api/carbon/offsets', data);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/carbon/offsets'] });
      queryClient.invalidateQueries({ queryKey: ['/api/carbon/summary'] });
      toast({
        title: "Offset recorded",
        description: "A new carbon offset has been recorded",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error recording offset",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  return {
    // Data
    carbonCategories,
    carbonPreferences,
    carbonImpacts,
    carbonOffsets,
    carbonSummary,
    
    // Loading states
    isLoadingCategories,
    isLoadingPreferences,
    isLoadingImpacts,
    isLoadingOffsets,
    isLoadingSummary,
    
    // Mutations
    updateCarbonPreferences: updateCarbonPreferencesMutation.mutate,
    recordCarbonImpact: recordCarbonImpactMutation.mutate,
    recordCarbonOffset: recordCarbonOffsetMutation.mutate,
    
    // Mutation states
    isUpdatingPreferences: updateCarbonPreferencesMutation.isPending,
    isRecordingImpact: recordCarbonImpactMutation.isPending,
    isRecordingOffset: recordCarbonOffsetMutation.isPending,
  };
}