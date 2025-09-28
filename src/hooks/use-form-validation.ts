import { useState } from 'react';

interface ValidationRule {
  condition: (value: unknown) => boolean;
  message: string;
}

export const useFormValidation = (initialValues: Record<string, unknown> = {}) => {
  const [values, setValues] = useState<Record<string, unknown>>(initialValues);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const validateField = (fieldName: string, value: unknown, rules: ValidationRule[]) => {
    for (const rule of rules) {
      if (!rule.condition(value)) {
        setErrors(prev => ({ ...prev, [fieldName]: rule.message }));
        return false;
      }
    }
    setErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[fieldName];
      return newErrors;
    });
    return true;
  };

  const handleChange = (fieldName: string, value: unknown) => {
    setValues(prev => ({ ...prev, [fieldName]: value }));
    
    // Clear error when user starts typing
    if (errors[fieldName]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[fieldName];
        return newErrors;
      });
    }
  };

  const handleBlur = (fieldName: string, rules: ValidationRule[]) => {
    setTouched(prev => ({ ...prev, [fieldName]: true }));
    const value = values[fieldName];
    validateField(fieldName, value, rules);
  };

  const validateForm = (formRules: Record<string, ValidationRule[]>) => {
    let isValid = true;

    for (const fieldName in formRules) {
      const fieldRules = formRules[fieldName];
      const value = values[fieldName];
      const isFieldValid = validateField(fieldName, value, fieldRules);
      
      if (!isFieldValid) {
        isValid = false;
      }
    }

    return isValid;
  };

  const resetForm = (newInitialValues?: Record<string, unknown>) => {
    setValues(newInitialValues || initialValues);
    setErrors({});
    setTouched({});
  };

  return {
    values,
    errors,
    touched,
    handleChange,
    handleBlur,
    validateForm,
    resetForm,
    setValues,
    setErrors
  };
};