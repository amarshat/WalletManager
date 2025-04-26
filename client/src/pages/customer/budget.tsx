import { useState, useEffect } from "react";
import CustomerLayout from "@/components/layouts/CustomerLayout";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { BudgetSunburst } from "@/components/ui/budget-sunburst";
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { useBudget } from "@/hooks/use-budget";
import { useAuth } from "@/hooks/use-auth";
import { DEFAULT_BUDGET_CATEGORIES } from "@shared/budget-constants";
import { InsertBudgetPlan, InsertBudgetAllocation } from "@shared/schema";
import { PlusCircle, Wallet } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { budgetPlans } from "@shared/schema";

// Extended schema for client-side validation
const clientBudgetPlanSchema = createInsertSchema(budgetPlans).extend({
  name: z.string().min(3, "Name must be at least 3 characters"),
  totalAmount: z.string().refine(
    (val) => !isNaN(Number(val)) && Number(val) > 0,
    "Amount must be a positive number"
  ),
  startDate: z.string().refine(
    (val) => !isNaN(Date.parse(val)),
    "Start date must be valid"
  ),
  endDate: z.string().refine(
    (val) => !isNaN(Date.parse(val)),
    "End date must be valid"
  ),
});

type CreateBudgetFormValues = z.infer<typeof clientBudgetPlanSchema>;

export default function BudgetPage() {
  const { categories, activePlan, allocations, transactions, isLoading, createPlan, createCategory } = useBudget();
  const { user } = useAuth();
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [tabValue, setTabValue] = useState<string>("overview");
  
  const form = useForm<CreateBudgetFormValues>({
    resolver: zodResolver(clientBudgetPlanSchema),
    defaultValues: {
      name: "Monthly Budget",
      currencyCode: user?.defaultCurrency || "USD",
      totalAmount: "",
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date(new Date().setMonth(new Date().getMonth() + 1)).toISOString().split('T')[0],
      isActive: true,
    },
  });
  
  // Initialize default categories if none exist
  useEffect(() => {
    const initializeDefaultCategories = async () => {
      if (categories.length === 0 && !isLoading.categories) {
        // Create default categories
        for (const category of DEFAULT_BUDGET_CATEGORIES) {
          await createCategory({
            name: category.name,
            color: category.color,
            icon: category.icon
          });
        }
      }
    };
    
    initializeDefaultCategories();
  }, [categories, isLoading.categories, createCategory]);
  
  const onSubmit = async (data: CreateBudgetFormValues) => {
    try {
      // Convert string dates to Date objects for the API
      const planData: Omit<InsertBudgetPlan, "userId"> = {
        name: data.name,
        currencyCode: data.currencyCode,
        totalAmount: data.totalAmount,
        startDate: new Date(data.startDate),
        endDate: new Date(data.endDate),
        isActive: true,
      };
      
      // Prepare allocations - divide the total amount equally among all categories
      const totalCategories = categories.length;
      if (totalCategories > 0) {
        const amountPerCategory = Number(data.totalAmount) / totalCategories;
        
        const allocations: Omit<InsertBudgetAllocation, "budgetPlanId" | "spentAmount">[] = 
          categories.map(category => ({
            categoryId: category.id,
            allocatedAmount: amountPerCategory.toFixed(2),
          }));
        
        await createPlan(planData, allocations);
        setCreateDialogOpen(false);
      } else {
        await createPlan(planData);
        setCreateDialogOpen(false);
      }
    } catch (error) {
      console.error("Failed to create budget plan:", error);
    }
  };
  
  return (
    <CustomerLayout>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Budget Management</h1>
          <p className="text-muted-foreground">Track and manage your spending</p>
        </div>
        <Button 
          variant="default" 
          onClick={() => setCreateDialogOpen(true)}
          disabled={isLoading.categories}
        >
          <PlusCircle className="mr-2 h-4 w-4" />
          Create Budget
        </Button>
      </div>
      
      <Tabs defaultValue="overview" value={tabValue} onValueChange={setTabValue} className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="transactions">Transactions</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-4">
          {!activePlan && (
            <Card>
              <CardHeader>
                <CardTitle>No Active Budget</CardTitle>
                <CardDescription>Create a budget to start tracking your expenses</CardDescription>
              </CardHeader>
              <CardContent className="flex justify-center py-6">
                <div className="text-center">
                  <Wallet className="mx-auto h-12 w-12 text-muted-foreground" />
                  <h3 className="mt-4 text-lg font-medium">Get started with budgeting</h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Create a budget plan to visualize your spending and track financial goals.
                  </p>
                  <Button 
                    variant="default" 
                    className="mt-4" 
                    onClick={() => setCreateDialogOpen(true)}
                    disabled={isLoading.categories}
                  >
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Create Budget
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
          
          {activePlan && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="md:col-span-2">
                  <CardHeader>
                    <CardTitle>{activePlan.name}</CardTitle>
                    <CardDescription>
                      {new Date(activePlan.startDate).toLocaleDateString()} - {new Date(activePlan.endDate).toLocaleDateString()}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <BudgetSunburst
                      allocations={allocations}
                      categories={categories}
                      isLoading={isLoading.allocations}
                      currencyCode={activePlan.currencyCode}
                    />
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle>Budget Summary</CardTitle>
                    <CardDescription>Current spending status</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-8">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Total Budget</span>
                        <span className="font-bold">{formatCurrency(Number(activePlan.totalAmount), activePlan.currencyCode)}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Total Spent</span>
                        <span className="font-bold">
                          {formatCurrency(
                            allocations.reduce((acc, curr) => acc + Number(curr.spentAmount), 0),
                            activePlan.currencyCode
                          )}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Remaining</span>
                        <span className="font-bold text-green-600">
                          {formatCurrency(
                            Number(activePlan.totalAmount) - allocations.reduce((acc, curr) => acc + Number(curr.spentAmount), 0),
                            activePlan.currencyCode
                          )}
                        </span>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <h3 className="text-sm font-medium">Top Spending Categories</h3>
                      {[...allocations]
                        .sort((a, b) => Number(b.spentAmount) - Number(a.spentAmount))
                        .slice(0, 3)
                        .map((allocation) => {
                          const category = categories.find(cat => cat.id === allocation.categoryId);
                          if (!category) return null;
                          
                          return (
                            <div key={allocation.id} className="flex items-center justify-between">
                              <div className="flex items-center">
                                <div 
                                  className="w-3 h-3 rounded-full mr-2" 
                                  style={{ backgroundColor: category.color }}
                                />
                                <span className="text-sm">{category.name}</span>
                              </div>
                              <span className="text-sm font-medium">
                                {formatCurrency(Number(allocation.spentAmount), activePlan.currencyCode)}
                              </span>
                            </div>
                          );
                        })}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </>
          )}
        </TabsContent>
        
        <TabsContent value="transactions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Budget Transactions</CardTitle>
              <CardDescription>Recent spending by category</CardDescription>
            </CardHeader>
            <CardContent>
              {transactions.length === 0 ? (
                <div className="text-center py-6">
                  <p className="text-muted-foreground">No transactions recorded yet</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {transactions.map((transaction) => {
                    const category = categories.find(cat => cat.id === transaction.categoryId);
                    return (
                      <div key={transaction.id} className="flex items-center justify-between border-b pb-2">
                        <div className="flex items-center">
                          <div 
                            className="w-3 h-3 rounded-full mr-2" 
                            style={{ backgroundColor: category?.color || '#6366F1' }}
                          />
                          <div>
                            <p className="text-sm font-medium">{category?.name || 'Uncategorized'}</p>
                            <p className="text-xs text-muted-foreground">
                              {new Date(transaction.transactionDate).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className={`text-sm font-medium ${transaction.isIncome ? 'text-green-600' : ''}`}>
                            {transaction.isIncome ? '+' : ''}{formatCurrency(Number(transaction.amount), user?.defaultCurrency || 'USD')}
                          </p>
                          {transaction.description && (
                            <p className="text-xs text-muted-foreground">{transaction.description}</p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      {/* Create Budget Dialog */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Create New Budget</DialogTitle>
            <DialogDescription>
              Create a budget plan to track your expenses by category
            </DialogDescription>
          </DialogHeader>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Budget Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Monthly Budget" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="totalAmount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Total Budget Amount</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        min="0" 
                        step="0.01" 
                        placeholder="1000.00" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="startDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Start Date</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="endDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>End Date</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <DialogFooter>
                <Button type="submit">Create Budget</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </CustomerLayout>
  );
}