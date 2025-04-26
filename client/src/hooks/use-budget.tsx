import { createContext, ReactNode, useContext, useState } from "react";
import {
  useQuery,
  useMutation,
} from "@tanstack/react-query";
import { 
  BudgetCategory, 
  BudgetPlan, 
  BudgetAllocation, 
  BudgetTransaction,
  InsertBudgetCategory,
  InsertBudgetPlan,
  InsertBudgetAllocation,
  InsertBudgetTransaction 
} from "@shared/schema";
import { apiRequest, queryClient } from "../lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";

type BudgetContextType = {
  categories: BudgetCategory[];
  plans: BudgetPlan[];
  activePlan: BudgetPlan | null;
  allocations: BudgetAllocation[];
  transactions: BudgetTransaction[];
  isLoading: {
    categories: boolean;
    plans: boolean;
    activePlan: boolean;
    allocations: boolean;
    transactions: boolean;
  };
  createCategory: (data: Omit<InsertBudgetCategory, "userId" | "isSystem">) => Promise<BudgetCategory>;
  createPlan: (data: Omit<InsertBudgetPlan, "userId">, allocations?: Omit<InsertBudgetAllocation, "budgetPlanId" | "spentAmount">[]) => Promise<BudgetPlan>;
  createTransaction: (data: Omit<InsertBudgetTransaction, "userId">) => Promise<BudgetTransaction>;
  refetchAll: () => Promise<void>;
};

export const BudgetContext = createContext<BudgetContextType | null>(null);

export function BudgetProvider({ children }: { children: ReactNode }) {
  const { toast } = useToast();
  const { user } = useAuth();
  const [allocations, setAllocations] = useState<BudgetAllocation[]>([]);

  // Fetch categories
  const {
    data: categories = [],
    isLoading: categoriesLoading,
    refetch: refetchCategories
  } = useQuery<BudgetCategory[]>({
    queryKey: ['/api/budget/categories'],
    enabled: !!user,
  });

  // Fetch budget plans
  const {
    data: plans = [],
    isLoading: plansLoading,
    refetch: refetchPlans
  } = useQuery<BudgetPlan[]>({
    queryKey: ['/api/budget/plans'],
    enabled: !!user,
  });

  // Fetch active budget plan
  const {
    data: activePlan,
    isLoading: activePlanLoading,
    refetch: refetchActivePlan
  } = useQuery<BudgetPlan>({
    queryKey: ['/api/budget/plans/active'],
    enabled: !!user,
    onSuccess: (plan) => {
      // Fetch allocations for the active plan
      if (plan?.id) {
        fetchAllocations(plan.id);
      }
    },
    onError: () => {
      // Clear allocations if there's no active plan
      setAllocations([]);
    }
  });

  // Fetch transactions
  const {
    data: transactions = [],
    isLoading: transactionsLoading,
    refetch: refetchTransactions
  } = useQuery<BudgetTransaction[]>({
    queryKey: ['/api/budget/transactions'],
    enabled: !!user,
  });

  // Fetch allocations for a plan
  const fetchAllocations = async (planId: number) => {
    try {
      const response = await apiRequest('GET', `/api/budget/plans/${planId}/allocations`);
      const data = await response.json();
      setAllocations(data);
    } catch (error) {
      console.error('Error fetching allocations:', error);
      toast({
        title: "Error",
        description: "Failed to load budget allocations",
        variant: "destructive",
      });
    }
  };

  // Mutation to create a new category
  const createCategoryMutation = useMutation({
    mutationFn: async (data: Omit<InsertBudgetCategory, "userId" | "isSystem">) => {
      const res = await apiRequest('POST', '/api/budget/categories', data);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/budget/categories'] });
      toast({
        title: "Success",
        description: "Budget category created",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create budget category",
        variant: "destructive",
      });
    },
  });

  // Mutation to create a new budget plan
  const createPlanMutation = useMutation({
    mutationFn: async ({ 
      planData, 
      allocations 
    }: { 
      planData: Omit<InsertBudgetPlan, "userId">, 
      allocations?: Omit<InsertBudgetAllocation, "budgetPlanId" | "spentAmount">[] 
    }) => {
      const res = await apiRequest('POST', '/api/budget/plans', {
        ...planData,
        allocations
      });
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/budget/plans'] });
      queryClient.invalidateQueries({ queryKey: ['/api/budget/plans/active'] });
      toast({
        title: "Success",
        description: "Budget plan created",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create budget plan",
        variant: "destructive",
      });
    },
  });

  // Mutation to create a new transaction
  const createTransactionMutation = useMutation({
    mutationFn: async (data: Omit<InsertBudgetTransaction, "userId">) => {
      const res = await apiRequest('POST', '/api/budget/transactions', data);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/budget/transactions'] });
      // Also refetch allocations for the active plan since spent amounts will change
      if (activePlan?.id) {
        fetchAllocations(activePlan.id);
      }
      toast({
        title: "Success",
        description: "Transaction recorded",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to record transaction",
        variant: "destructive",
      });
    },
  });

  // Helper function to create a category
  const createCategory = async (data: Omit<InsertBudgetCategory, "userId" | "isSystem">) => {
    return createCategoryMutation.mutateAsync(data);
  };

  // Helper function to create a plan with optional allocations
  const createPlan = async (
    planData: Omit<InsertBudgetPlan, "userId">, 
    allocations?: Omit<InsertBudgetAllocation, "budgetPlanId" | "spentAmount">[]
  ) => {
    return createPlanMutation.mutateAsync({ planData, allocations });
  };

  // Helper function to create a transaction
  const createTransaction = async (data: Omit<InsertBudgetTransaction, "userId">) => {
    return createTransactionMutation.mutateAsync(data);
  };

  // Helper function to refetch all data
  const refetchAll = async () => {
    await Promise.all([
      refetchCategories(),
      refetchPlans(),
      refetchActivePlan(),
      refetchTransactions()
    ]);
  };

  return (
    <BudgetContext.Provider
      value={{
        categories,
        plans,
        activePlan: activePlan || null,
        allocations,
        transactions,
        isLoading: {
          categories: categoriesLoading,
          plans: plansLoading,
          activePlan: activePlanLoading,
          allocations: activePlanLoading, // Use the active plan loading state for allocations too
          transactions: transactionsLoading,
        },
        createCategory,
        createPlan,
        createTransaction,
        refetchAll,
      }}
    >
      {children}
    </BudgetContext.Provider>
  );
}

export function useBudget() {
  const context = useContext(BudgetContext);
  if (!context) {
    throw new Error("useBudget must be used within a BudgetProvider");
  }
  return context;
}