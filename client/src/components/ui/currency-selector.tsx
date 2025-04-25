import { Button } from "@/components/ui/button";
import { Currency } from "@shared/schema";

interface CurrencySelectorProps {
  currencies: Currency[];
  selectedCurrency: string;
  onSelect: (currencyCode: string) => void;
}

export default function CurrencySelector({
  currencies,
  selectedCurrency,
  onSelect
}: CurrencySelectorProps) {
  return (
    <div className="flex items-center mb-6 overflow-x-auto pb-2 -mx-2 px-2">
      {currencies.map((currency) => (
        <Button
          key={currency.code}
          variant={currency.code === selectedCurrency ? "default" : "outline"}
          className="mx-1 px-4 py-2 rounded-full text-sm font-medium"
          onClick={() => onSelect(currency.code)}
        >
          <span>{currency.code}</span>
        </Button>
      ))}
    </div>
  );
}
