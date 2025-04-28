import { useQuery, useMutation } from "@tanstack/react-query";
import { toast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";

// Types for carbon data
export type CarbonCategory = {
  id: number;
  category: string;
  description: string;
  carbonFactor: number;
  icon: string;
  color: string;
};

export type CarbonPreference = {
  id?: number;
  userId: number;
  trackingEnabled: boolean;
  offsetEnabled: boolean;
  offsetPercentage?: number;
  updatedAt?: Date;
};

export type CarbonImpact = {
  id: number;
  userId: number;
  category: string;
  description: string;
  amount: number;
  carbonFootprint: number;
  transactionId?: string;
  transactionDate: Date;
  createdAt?: Date;
};

export type CarbonOffset = {
  id: number;
  userId: number;
  offsetAmount: number;
  description: string;
  contributionDate: Date;
  createdAt?: Date;
};

export type CarbonSummary = {
  totalImpact: number;
  totalOffset: number;
  netImpact: number;
  impactByCategory: Record<string, number>;
  monthlyAverage: number;
};

export function useCarbon() {
  // Get carbon categories
  const {
    data: categories,
    isLoading: isCategoriesLoading,
    error: categoriesError
  } = useQuery<CarbonCategory[]>({
    queryKey: ['/api/carbon/categories'],
  });

  // Get user preferences
  const {
    data: preferences,
    isLoading: isPreferencesLoading,
    error: preferencesError
  } = useQuery<CarbonPreference>({
    queryKey: ['/api/carbon/preferences'],
  });

  // Get carbon impact history
  const {
    data: impacts,
    isLoading: isImpactsLoading,
    error: impactsError,
    refetch: refetchImpacts
  } = useQuery<CarbonImpact[]>({
    queryKey: ['/api/carbon/impacts'],
  });

  // Get carbon offsets history
  const {
    data: offsets,
    isLoading: isOffsetsLoading,
    error: offsetsError,
    refetch: refetchOffsets
  } = useQuery<CarbonOffset[]>({
    queryKey: ['/api/carbon/offsets'],
  });

  // Get carbon summary
  const {
    data: summary,
    isLoading: isSummaryLoading,
    error: summaryError,
    refetch: refetchSummary
  } = useQuery<CarbonSummary>({
    queryKey: ['/api/carbon/summary'],
  });

  // Update user preferences
  const updatePreferencesMutation = useMutation({
    mutationFn: async (data: Partial<CarbonPreference>) => {
      const res = await apiRequest('POST', '/api/carbon/preferences', data);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/carbon/preferences'] });
      toast({
        title: "Preferences updated",
        description: "Your carbon tracking preferences have been updated."
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to update preferences",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  // Record a carbon impact
  const recordImpactMutation = useMutation({
    mutationFn: async (data: Omit<CarbonImpact, 'id' | 'userId' | 'createdAt'>) => {
      const res = await apiRequest('POST', '/api/carbon/impact', data);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/carbon/impacts'] });
      queryClient.invalidateQueries({ queryKey: ['/api/carbon/summary'] });
      toast({
        title: "Carbon impact recorded",
        description: "Your carbon footprint has been calculated and recorded."
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to record carbon impact",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  // Record a carbon offset
  const recordOffsetMutation = useMutation({
    mutationFn: async (data: Omit<CarbonOffset, 'id' | 'userId' | 'createdAt'>) => {
      const res = await apiRequest('POST', '/api/carbon/offset', data);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/carbon/offsets'] });
      queryClient.invalidateQueries({ queryKey: ['/api/carbon/summary'] });
      toast({
        title: "Carbon offset recorded",
        description: "Your carbon offset contribution has been recorded."
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to record carbon offset",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  // Helper function to calculate carbon footprint for a transaction
  const calculateFootprint = (amount: number, category: string) => {
    if (!categories) return 0;
    
    const categoryData = categories.find(c => c.category === category);
    if (!categoryData) return 0;
    
    return amount * categoryData.carbonFactor;
  };

  return {
    // Data
    categories,
    preferences,
    impacts,
    offsets,
    summary,
    
    // Loading states
    isCategoriesLoading,
    isPreferencesLoading,
    isImpactsLoading,
    isOffsetsLoading,
    isSummaryLoading,
    isLoading: isCategoriesLoading || isPreferencesLoading || isImpactsLoading || isOffsetsLoading || isSummaryLoading,
    
    // Errors
    categoriesError,
    preferencesError,
    impactsError,
    offsetsError,
    summaryError,
    
    // Mutations
    updatePreferencesMutation,
    recordImpactMutation,
    recordOffsetMutation,
    
    // Refetch functions
    refetchImpacts,
    refetchOffsets,
    refetchSummary,
    
    // Helper functions
    calculateFootprint,
    
    // Derived data
    isTrackingEnabled: preferences?.trackingEnabled || false,
    isOffsetEnabled: preferences?.offsetEnabled || false,
    offsetPercentage: preferences?.offsetPercentage || 0,
  };
}