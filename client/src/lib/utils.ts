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

/**
 * Format a card number with spaces for readability
 */
export function formatCardNumber(cardNumber: string): string {
  // Remove any existing non-digit characters
  const cleaned = cardNumber.replace(/\D/g, '');
  
  // Add a space every 4 characters
  const formatted = cleaned.replace(/(\d{4})(?=\d)/g, '$1 ');
  
  return formatted;
}

/**
 * Format a number with proper decimal places for display
 * @param amount - The number to format
 * @param decimals - Number of decimal places (default: 2)
 * @returns Formatted number as string
 */
export function formatAmount(amount: number, decimals: number = 2): string {
  // Ensure amount is a valid number
  if (isNaN(amount)) return '0';
  
  // Format with fixed decimal places but remove trailing zeros
  const formatted = amount.toFixed(decimals);
  
  // Remove trailing zeros and decimal point if needed
  return formatted.replace(/\.?0+$/, '');
}
