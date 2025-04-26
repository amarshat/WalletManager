import { createContext, ReactNode, useContext } from "react";
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
  
  const {
    data: brand,
    error,
    isLoading,
    refetch
  } = useQuery<BrandSettings, Error>({
    queryKey: ["/api/brand"],
  });

  const mutation = useMutation({
    mutationFn: async (data: Partial<InsertBrandSettings>) => {
      const res = await apiRequest("PUT", "/api/brand", data);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/brand"] });
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

  const updateBrand = async (data: Partial<InsertBrandSettings>) => {
    await mutation.mutateAsync(data);
  };

  const refetchBrand = async () => {
    await refetch();
  };

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
