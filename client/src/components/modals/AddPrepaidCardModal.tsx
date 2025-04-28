import { useState } from "react";
import { usePrepaidCards } from "@/hooks/use-prepaid-cards";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
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
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { supportedCurrencies } from "@shared/schema";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, CreditCard } from "lucide-react";

const FormSchema = z.object({
  cardholderName: z.string().min(1, "Cardholder name is required"),
  cardNumber: z.string()
    .min(16, "Card number must be 16 digits")
    .max(16, "Card number must be 16 digits")
    .regex(/^\d+$/, "Card number must contain only digits"),
  expiryMonth: z.string().min(1, "Expiry month is required"),
  expiryYear: z.string().min(1, "Expiry year is required"),
  cvv: z.string()
    .min(3, "CVV must be 3-4 digits")
    .max(4, "CVV must be 3-4 digits")
    .regex(/^\d+$/, "CVV must contain only digits"),
  currencyCode: z.string().min(1, "Currency is required"),
  balance: z.preprocess(
    (val) => (val === "" ? 0 : Number(val)),
    z.number().min(0, "Balance must be a positive number")
  ),
  isDefault: z.boolean().optional(),
  cardDesign: z.string().optional(),
});

type FormValues = z.infer<typeof FormSchema>;

interface AddPrepaidCardModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function AddPrepaidCardModal({
  open,
  onOpenChange,
}: AddPrepaidCardModalProps) {
  const { user } = useAuth();
  const { addPrepaidCard, isAddingPrepaidCard, prepaidCardLimit, prepaidCards } = usePrepaidCards();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const form = useForm<FormValues>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      cardholderName: user?.fullName || "",
      cardNumber: "",
      expiryMonth: "",
      expiryYear: "",
      cvv: "",
      currencyCode: user?.defaultCurrency || "USD",
      balance: 0,
      isDefault: prepaidCards.length === 0, // Default to true if this is the first card
      cardDesign: "default",
    },
  });

  function onSubmit(data: FormValues) {
    setIsSubmitting(true);
    
    // Format card number to show only last 4 digits
    const last4 = data.cardNumber.slice(-4);
    
    // Generate a random card number if the user didn't enter one
    // This is just for display purposes
    if (!data.cardNumber || data.cardNumber.length < 16) {
      data.cardNumber = "4" + Math.floor(Math.random() * 1000000000000000).toString().padStart(15, "0");
    }
    
    addPrepaidCard({
      cardholderName: data.cardholderName,
      cardNumber: data.cardNumber,
      last4,
      expiryMonth: data.expiryMonth,
      expiryYear: data.expiryYear,
      cardType: "MASTERCARD", // Default as per requirements
      isDefault: data.isDefault,
      currencyCode: data.currencyCode,
      balance: data.balance,
      cardDesign: data.cardDesign,
      status: "ACTIVE",
    }, {
      onSuccess: () => {
        setIsSubmitting(false);
        form.reset();
        onOpenChange(false);
      },
      onError: () => {
        setIsSubmitting(false);
      },
    });
  }

  // Generate months for dropdown
  const months = Array.from({ length: 12 }, (_, i) => {
    const month = i + 1;
    return { 
      value: month.toString().padStart(2, "0"), 
      label: month.toString().padStart(2, "0") 
    };
  });

  // Generate years for dropdown (current year + 10 years)
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 10 }, (_, i) => {
    const year = currentYear + i;
    return { 
      value: year.toString(), 
      label: year.toString() 
    };
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add a Prepaid Card</DialogTitle>
          <DialogDescription>
            You can add up to {prepaidCardLimit} prepaid cards to your wallet.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="cardholderName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Cardholder Name</FormLabel>
                  <FormControl>
                    <Input placeholder="John Doe" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="cardNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Card Number</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="1234 5678 9012 3456" 
                      maxLength={16}
                      {...field} 
                    />
                  </FormControl>
                  <FormDescription>
                    16-digit card number with no spaces.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="grid grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="expiryMonth"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Month</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="MM" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {months.map((month) => (
                          <SelectItem key={month.value} value={month.value}>
                            {month.label}
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
                name="expiryYear"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Year</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="YYYY" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {years.map((year) => (
                          <SelectItem key={year.value} value={year.value}>
                            {year.label}
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
                name="cvv"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>CVV</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="123" 
                        maxLength={4}
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
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
                      {supportedCurrencies.map((currency) => (
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
            
            <FormField
              control={form.control}
              name="balance"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Initial Balance</FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      min="0"
                      step="0.01"
                      placeholder="0.00" 
                      {...field}
                      onChange={(e) => field.onChange(e.target.valueAsNumber || 0)}
                    />
                  </FormControl>
                  <FormDescription>
                    The initial amount to load on the card.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="isDefault"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>Set as default card</FormLabel>
                    <FormDescription>
                      This card will be used by default for prepaid transactions.
                    </FormDescription>
                  </div>
                </FormItem>
              )}
            />
            
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting || isAddingPrepaidCard}>
                {(isSubmitting || isAddingPrepaidCard) && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Add Card
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}