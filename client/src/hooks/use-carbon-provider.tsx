import { ReactNode, createContext, useContext } from "react";
import { useCarbon } from "@/hooks/use-carbon";

// Create a context for carbon data
const CarbonContext = createContext<ReturnType<typeof useCarbon> | undefined>(undefined);

// Carbon provider component
export function CarbonProvider({ children }: { children: ReactNode }) {
  const {
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
    updateCarbonPreferences,
    recordCarbonImpact,
    recordCarbonOffset,
    
    // Mutation states
    isUpdatingPreferences,
    isRecordingImpact,
    isRecordingOffset,
  } = useCarbon();
  
  return (
    <CarbonContext.Provider value={{
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
      updateCarbonPreferences,
      recordCarbonImpact,
      recordCarbonOffset,
      
      // Mutation states
      isUpdatingPreferences,
      isRecordingImpact,
      isRecordingOffset,
    }}>
      {children}
    </CarbonContext.Provider>
  );
}

// Hook to use carbon context
export function useCarbonContext() {
  const context = useContext(CarbonContext);
  if (context === undefined) {
    throw new Error("useCarbonContext must be used within a CarbonProvider");
  }
  return context;
}