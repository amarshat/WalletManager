import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useFieldArray } from "react-hook-form";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Plus, Trash2, Clipboard } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supportedCurrencies } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";

// Define the schema for the admin transfer form
const AdminTransferSchema = z.object({
  sourceUserName: z.string().min(1, "Source user is required"),
  currencyCode: z.string().min(1, "Currency is required"),
  transfers: z.array(
    z.object({
      destinationUserName: z.string().min(1, "Destination user is required"),
      amount: z.coerce.number().positive("Amount must be greater than 0"),
    })
  ).min(1, "At least one transfer is required"),
});

type AdminTransferValues = z.infer<typeof AdminTransferSchema>;

interface UserWithWallet {
  id: number;
  username: string;
  fullName: string;
  email?: string;
  hasWallet: boolean;
  wallet: {
    id: number;
    customerId: string;
  } | null;
  balances: {
    accounts?: Array<{
      currencyCode: string;
      balance: string;
    }>;
  } | null;
}

interface AdminTransferModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function AdminTransferModal({ open, onOpenChange }: AdminTransferModalProps) {
  const { toast } = useToast();
  const [sourceUser, setSourceUser] = useState<UserWithWallet | null>(null);
  const [availableBalance, setAvailableBalance] = useState(0);
  const [selectedCurrency, setSelectedCurrency] = useState("");

  // Fetch users with wallet info
  const { data: users = [], isLoading: isLoadingUsers } = useQuery<UserWithWallet[]>({
    queryKey: ["/api/admin/users-with-wallets"],
    enabled: open,
  });

  const form = useForm<AdminTransferValues>({
    resolver: zodResolver(AdminTransferSchema),
    defaultValues: {
      sourceUserName: "",
      currencyCode: "USD",
      transfers: [{ destinationUserName: "", amount: 0 }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "transfers",
  });

  // Admin transfer mutation
  const adminTransferMutation = useMutation({
    mutationFn: async (data: AdminTransferValues) => {
      const response = await apiRequest("POST", "/api/admin/bulk-transfer", data);
      return await response.json();
    },
    onSuccess: () => {
      toast({
        title: "Transfer successful",
        description: "Funds have been transferred to the selected users",
      });
      onOpenChange(false);
      form.reset();
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users-with-wallets"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Transfer failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Update available balance when source user or currency changes
  useEffect(() => {
    const sourceUsername = form.watch("sourceUserName");
    const currencyCode = form.watch("currencyCode");

    if (sourceUsername && currencyCode) {
      const selectedUser = users.find(user => user.username === sourceUsername);
      setSourceUser(selectedUser || null);

      if (selectedUser?.balances?.accounts) {
        const accountWithCurrency = selectedUser.balances.accounts.find(
          acc => acc.currencyCode === currencyCode
        );
        
        if (accountWithCurrency) {
          setAvailableBalance(parseFloat(accountWithCurrency.balance));
        } else {
          setAvailableBalance(0);
        }
      } else {
        setAvailableBalance(0);
      }
    } else {
      setSourceUser(null);
      setAvailableBalance(0);
    }
    
    setSelectedCurrency(currencyCode);
  }, [form.watch("sourceUserName"), form.watch("currencyCode"), users]);

  // Calculate total transfer amount
  const getTotalTransferAmount = () => {
    const transfers = form.watch("transfers");
    return transfers.reduce((total, transfer) => {
      const amount = parseFloat(transfer.amount?.toString() || "0");
      return isNaN(amount) ? total : total + amount;
    }, 0);
  };

  // Check if transfer amount exceeds available balance
  const isExceedingBalance = () => {
    return getTotalTransferAmount() > availableBalance;
  };

  // Function to fill all transfer amounts with the same value
  const fillAllTransfers = (amount: number) => {
    const transfers = form.getValues("transfers");
    transfers.forEach((transfer, index) => {
      form.setValue(`transfers.${index}.amount`, amount);
    });
  };

  // Function to distribute available balance equally among all transfers
  const distributeEqually = () => {
    const transfers = form.getValues("transfers");
    if (transfers.length === 0) return;
    
    const equalAmount = parseFloat((availableBalance / transfers.length).toFixed(2));
    fillAllTransfers(equalAmount);
  };

  const onSubmit = (data: AdminTransferValues) => {
    if (isExceedingBalance()) {
      toast({
        title: "Invalid transfer",
        description: "Total transfer amount exceeds available balance",
        variant: "destructive",
      });
      return;
    }
    
    adminTransferMutation.mutate(data);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Admin Transfer</DialogTitle>
          <DialogDescription>
            Transfer funds from one user to multiple users at once
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="sourceUserName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Source User</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select source user" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {users
                          .filter(user => user.hasWallet)
                          .map(user => (
                            <SelectItem key={user.id} value={user.username}>
                              {user.fullName} ({user.username})
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="currencyCode"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Currency</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select currency" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {supportedCurrencies.map(currency => (
                          <SelectItem key={currency.code} value={currency.code}>
                            {currency.code} - {currency.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {sourceUser && (
              <div className="bg-blue-50 p-3 rounded-md">
                <div className="flex justify-between mb-2">
                  <span className="font-medium">Source: {sourceUser.fullName}</span>
                  <span className="font-medium">Available: {selectedCurrency} {availableBalance.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Total to transfer: {selectedCurrency} {getTotalTransferAmount().toFixed(2)}</span>
                  <span className={`text-sm ${isExceedingBalance() ? 'text-red-500 font-medium' : ''}`}>
                    {isExceedingBalance() ? 'Exceeds available balance!' : 'Balance is sufficient'}
                  </span>
                </div>
              </div>
            )}

            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-sm font-medium">Transfers</h3>
                
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => distributeEqually()}
                    disabled={!sourceUser || availableBalance <= 0}
                  >
                    <Clipboard className="h-4 w-4 mr-1" />
                    Distribute Equally
                  </Button>
                  
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const amount = parseFloat(prompt("Enter amount for all transfers:", "0") || "0");
                      if (!isNaN(amount) && amount >= 0) {
                        fillAllTransfers(amount);
                      }
                    }}
                    disabled={!sourceUser}
                  >
                    <Clipboard className="h-4 w-4 mr-1" />
                    Set All
                  </Button>
                </div>
              </div>
              
              {fields.map((field, index) => (
                <div key={field.id} className="flex gap-2 items-end">
                  <FormField
                    control={form.control}
                    name={`transfers.${index}.destinationUserName`}
                    render={({ field }) => (
                      <FormItem className="flex-1">
                        <FormLabel className={index !== 0 ? "sr-only" : undefined}>
                          Destination User
                        </FormLabel>
                        <Select 
                          onValueChange={field.onChange} 
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select destination" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {users
                              .filter(user => 
                                user.hasWallet && 
                                user.username !== form.watch("sourceUserName")
                              )
                              .map(user => (
                                <SelectItem key={user.id} value={user.username}>
                                  {user.fullName} ({user.username})
                                </SelectItem>
                              ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name={`transfers.${index}.amount`}
                    render={({ field }) => (
                      <FormItem className="w-32">
                        <FormLabel className={index !== 0 ? "sr-only" : undefined}>
                          Amount
                        </FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min="0.01"
                            step="0.01"
                            placeholder="0.00"
                            {...field}
                            onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => remove(index)}
                    disabled={fields.length === 1}
                    className="mb-[2px]"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}

              <Button
                type="button"
                variant="outline"
                size="sm"
                className="w-full"
                onClick={() => append({ destinationUserName: "", amount: 0 })}
              >
                <Plus className="h-4 w-4 mr-1" />
                Add Transfer
              </Button>
            </div>

            <DialogFooter>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={
                  adminTransferMutation.isPending ||
                  isExceedingBalance() ||
                  !sourceUser ||
                  getTotalTransferAmount() <= 0
                }
              >
                {adminTransferMutation.isPending && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Transfer Funds
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}