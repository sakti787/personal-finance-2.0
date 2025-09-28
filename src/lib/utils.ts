import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Currency formatter for Indonesian Rupiah
export function formatCurrency(value: number | string): string {
  if (typeof value === 'string') {
    value = parseFloat(value);
  }
  
  if (isNaN(value)) {
    return 'Rp. 0';
  }
  
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value).replace('Rp', 'Rp. ');
}

// Function to convert formatted currency string to number
export function parseCurrency(formattedValue: string): number {
  // Remove all non-numeric characters except for commas and periods
  const cleanedValue = formattedValue.replace(/[Rp.]/g, '').replace(/\s/g, '');
  const numberValue = parseFloat(cleanedValue);
  return isNaN(numberValue) ? 0 : numberValue;
}

// Function to format number with thousands separator for display
export function formatNumberWithThousandSeparator(value: number): string {
  return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}