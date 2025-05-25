import { createContext, ReactNode, useContext, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { BrandSettings, InsertBrandSettings } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

type BrandContextType = {
  brand: BrandSettings | null;
  isLoading: boolean;
  isLoadingBrand: boolean;
  error: Error | null;
  updateBrand: (data: Partial<InsertBrandSettings>) => Promise<void>;
  refetchBrand: () => Promise<void>;
};

export const BrandContext = createContext<BrandContextType | null>(null);

export function BrandProvider({ children }: { children: ReactNode }) {
  const { toast } = useToast();
  
  // Get tenant ID from URL params and localStorage
  const getTenantId = () => {
    // First check URL params
    const params = new URLSearchParams(window.location.search);
    const tenantParam = params.get('tenantId');
    
    if (tenantParam) {
      // Save to localStorage for future use
      localStorage.setItem('selectedTenantId', tenantParam);
      return tenantParam;
    }
    
    // Fall back to localStorage
    return localStorage.getItem('selectedTenantId');
  };
  
  const tenantId = getTenantId();
  
  // Query for brand settings with tenant ID
  const {
    data: brand,
    error,
    isLoading,
    refetch
  } = useQuery<BrandSettings, Error>({
    queryKey: ["/api/brand", tenantId],
    queryFn: async () => {
      const url = tenantId ? `/api/brand?tenantId=${tenantId}` : '/api/brand';
      const res = await fetch(url);
      if (!res.ok) {
        throw new Error('Failed to fetch brand settings');
      }
      return res.json();
    }
  });
  
  // Mutation for updating brand settings
  const mutation = useMutation({
    mutationFn: async (data: Partial<InsertBrandSettings>) => {
      const url = tenantId ? `/api/brand?tenantId=${tenantId}` : '/api/brand';
      const res = await apiRequest("PUT", url, data);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/brand", tenantId] });
      toast({
        title: "Brand settings updated",
        description: "Your changes have been saved successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Update failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Helper function to update brand settings
  const updateBrand = async (data: Partial<InsertBrandSettings>) => {
    await mutation.mutateAsync(data);
  };

  // Helper function to refetch brand settings
  const refetchBrand = async () => {
    await refetch();
  };

  // Listen for URL changes that might include tenant ID
  useEffect(() => {
    const handleUrlChange = () => {
      const newTenantId = getTenantId();
      if (newTenantId !== tenantId) {
        refetch();
      }
    };
    
    window.addEventListener('popstate', handleUrlChange);
    return () => window.removeEventListener('popstate', handleUrlChange);
  }, [tenantId, refetch]);

  return (
    <BrandContext.Provider
      value={{
        brand: brand ?? null,
        isLoading,
        isLoadingBrand: isLoading,
        error,
        updateBrand,
        refetchBrand
      }}
    >
      {children}
    </BrandContext.Provider>
  );
}

export function useBrand() {
  const context = useContext(BrandContext);
  if (!context) {
    throw new Error("useBrand must be used within a BrandProvider");
  }
  return context;
}
