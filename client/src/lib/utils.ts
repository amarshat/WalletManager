import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { supportedCurrencies } from "@shared/schema"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Format a number as currency with the appropriate symbol
 */
export function formatCurrency(amount: number, currencyCode: string = 'USD'): string {
  const currency = supportedCurrencies.find(c => c.code === currencyCode) || 
    { code: currencyCode, symbol: '$', name: currencyCode };
    
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currencyCode,
    currencyDisplay: 'symbol',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount).replace(currencyCode, currency.symbol);
}
