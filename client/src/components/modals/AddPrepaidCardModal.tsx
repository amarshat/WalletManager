import { useState, useEffect } from "react";
import { usePrepaidCards } from "@/hooks/use-prepaid-cards";
import { useAuth } from "@/hooks/use-auth";
import { useBrand } from "@/hooks/use-brand";
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
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const FormSchema = z.object({
  cardholderName: z.string().min(1, "Cardholder name is required"),
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
  const { brand } = useBrand();
  const { addPrepaidCard, isAddingPrepaidCard, prepaidCardLimit, prepaidCards } = usePrepaidCards();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Generate a Mastercard number that starts with 5 (Mastercard BIN range)
  const generateMastercardNumber = () => {
    // Mastercard numbers start with 51-55
    const prefix = "53"; // Using 53 as our PaySage Mastercard BIN prefix
    // Generate 14 more random digits
    const randomPart = Math.floor(Math.random() * 10000000000000000).toString().slice(0, 14);
    return prefix + randomPart;
  };
  
  // Generate CVV (3 digits for Mastercard)
  const generateCVV = () => {
    return Math.floor(Math.random() * 900 + 100).toString(); // 100-999
  };
  
  // Generate expiry date (between 3-5 years in the future)
  const generateExpiryDate = () => {
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth() + 1; // JavaScript months are 0-based
    const currentYear = currentDate.getFullYear();
    
    // Generate a date 3-5 years in the future
    const yearsToAdd = Math.floor(Math.random() * 3) + 3; // 3-5 years
    const expiryYear = currentYear + yearsToAdd;
    const expiryMonth = currentMonth.toString().padStart(2, "0");
    
    return {
      month: expiryMonth,
      year: expiryYear.toString()
    };
  };
  
  // Generate card details when modal opens
  const [cardNumber, setCardNumber] = useState("");
  const [last4, setLast4] = useState("");
  const [cvv, setCVV] = useState("");
  const [expiryDate, setExpiryDate] = useState({ month: "", year: "" });
  
  useEffect(() => {
    if (open) {
      // Generate new card details when modal opens
      const newCardNumber = generateMastercardNumber();
      const newLast4 = newCardNumber.slice(-4);
      const newCVV = generateCVV();
      const newExpiryDate = generateExpiryDate();
      
      setCardNumber(newCardNumber);
      setLast4(newLast4);
      setCVV(newCVV);
      setExpiryDate(newExpiryDate);
    }
  }, [open]);
  
  const form = useForm<FormValues>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      cardholderName: user?.fullName || "",
      currencyCode: user?.defaultCurrency || "USD",
      balance: 0,
      isDefault: prepaidCards.length === 0, // Default to true if this is the first card
      cardDesign: "default",
    },
  });

  function onSubmit(data: FormValues) {
    setIsSubmitting(true);
    
    addPrepaidCard({
      cardholderName: data.cardholderName,
      cardNumber: cardNumber,
      last4: last4,
      expiryMonth: expiryDate.month,
      expiryYear: expiryDate.year,
      cardType: "MASTERCARD", // Default as per requirements
      isDefault: data.isDefault,
      currencyCode: data.currencyCode,
      balance: data.balance.toString(), // Convert number to string as server expects a string
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
  
  // Brand name for card branding
  const brandName = brand?.name || "PaySage";

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
            
            <Alert className="bg-slate-50 border border-slate-200 shadow-sm">
              <CreditCard className="h-4 w-4 text-primary" />
              <AlertTitle className="text-sm font-semibold">Card Information</AlertTitle>
              <AlertDescription className="text-xs">
                <div className="mt-2 space-y-2">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <p className="font-semibold text-muted-foreground">Card Network</p>
                      <p>Mastercard</p>
                    </div>
                    <div>
                      <p className="font-semibold text-muted-foreground">Card Issuer</p>
                      <p>{brandName}</p>
                    </div>
                  </div>
                  <div>
                    <p className="font-semibold text-muted-foreground">Card Number</p>
                    <p className="font-mono">•••• •••• •••• {last4}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <p className="font-semibold text-muted-foreground">Expiry Date</p>
                      <p>{expiryDate.month}/{expiryDate.year.slice(-2)}</p>
                    </div>
                    <div>
                      <p className="font-semibold text-muted-foreground">CVV</p>
                      <p>{cvv}</p>
                    </div>
                  </div>
                </div>
              </AlertDescription>
            </Alert>
            
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