'use client';

import { Input } from '@/components/ui/input';
import { formatCurrency, parseCurrency } from '@/lib/utils';
import { forwardRef, useEffect, useState } from 'react';

interface CurrencyInputProps {
  value: number | string;
  onChange: (value: number) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

export const CurrencyInput = forwardRef<HTMLInputElement, CurrencyInputProps>(
  ({ value, onChange, placeholder, className, disabled }, ref) => {
    const [displayValue, setDisplayValue] = useState('');

    useEffect(() => {
      // Update display value when value prop changes
      if (typeof value === 'number') {
        setDisplayValue(formatCurrency(value));
      } else {
        setDisplayValue(value);
      }
    }, [value]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const rawValue = e.target.value;
      
      // Remove the "Rp. " prefix if present and extract the number
      const numberValue = parseCurrency(rawValue);
      
      setDisplayValue(formatCurrency(numberValue));
      onChange(numberValue);
    };

    const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
      // Show the raw number when focused for easier editing
      if (typeof value === 'number') {
        e.target.value = value.toString();
      }
    };

    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
      // Format as currency when blurred
      const numberValue = parseFloat(e.target.value);
      if (!isNaN(numberValue)) {
        setDisplayValue(formatCurrency(numberValue));
        onChange(numberValue);
      }
    };

    return (
      <Input
        ref={ref}
        type="text"
        inputMode="numeric"
        pattern="[0-9]*"
        value={displayValue}
        onChange={handleChange}
        onFocus={handleFocus}
        onBlur={handleBlur}
        placeholder={placeholder}
        className={className}
        disabled={disabled}
      />
    );
  }
);

CurrencyInput.displayName = 'CurrencyInput';