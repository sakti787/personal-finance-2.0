import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { useDataStore } from '@/lib/store/data-store';
import { uploadImageToCloudinary } from '@/lib/utils/cloudinary';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CurrencyInput } from '@/components/ui/currency-input';
import { Trash2 } from 'lucide-react';
import { GlassPanel } from '@/components/ui/glass-panel';

import { TransactionWithCategory } from '@/lib/types';

type AddTransactionContainerProps = {
  onSuccess?: () => void;
  editData?: Partial<TransactionWithCategory> | null;
};

export default function AddTransactionContainer({ onSuccess, editData }: AddTransactionContainerProps) {
  const { categories, addTransaction, updateTransaction, fetchTransactions, fetchCategories } = useDataStore();
  const formRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    fetchCategories();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Set preview URL for edit mode
  useEffect(() => {
    if (editData?.proof_url) {
      setPreviewUrl(editData.proof_url);
    } else {
      setPreviewUrl(null);
    }
  }, [editData]);

  // Mobile keyboard handling
  useEffect(() => {
    const handleFocus = () => {
      // On mobile, scroll the focused input into view after a short delay
      setTimeout(() => {
        if (formRef.current) {
          const focusedElement = document.activeElement;
          if (focusedElement && formRef.current.contains(focusedElement)) {
            focusedElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }
        }
      }, 300);
    };

    const handleResize = () => {
      // Handle viewport changes (keyboard show/hide)
      if (formRef.current) {
        formRef.current.scrollTop = 0;
      }
    };

    // Add event listeners for mobile keyboard handling
    document.addEventListener('focusin', handleFocus);
    window.addEventListener('resize', handleResize);

    return () => {
      document.removeEventListener('focusin', handleFocus);
      window.removeEventListener('resize', handleResize);
    };
  }, []);
  const [formData, setFormData] = useState<{
    description: string;
    amount: number;
    type: 'income' | 'expense';
    category_id: string;
    transaction_date: string;
    receipt?: File | null;
    id?: string;
    proof_url?: string;
  }>(() => {
    if (editData) {
      return {
        description: editData.description || '',
        amount: editData.amount || 0,
        type: editData.type || 'expense',
        category_id: editData.category_id || '',
        transaction_date: editData.transaction_date ? editData.transaction_date.split('T')[0] : new Date().toISOString().split('T')[0],
        receipt: null,
        id: editData.id,
        proof_url: editData.proof_url,
      };
    }
    return {
      description: '',
      amount: 0,
      type: 'expense',
      category_id: '',
      transaction_date: new Date().toISOString().split('T')[0],
      receipt: null,
    };
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    // Description now optional
    if (formData.amount <= 0) newErrors.amount = 'Amount must be greater than 0';
    if (!formData.transaction_date) newErrors.date = 'Date is required';
    if (!formData.category_id && formData.type === 'expense') newErrors.category_id = 'Category is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const resetForm = () => {
    setFormData({
      description: '',
      amount: 0,
      type: 'expense',
      category_id: '',
      transaction_date: new Date().toISOString().split('T')[0],
      receipt: null,
    });
    setPreviewUrl(null);
    setErrors({});
  };

  const handleDeletePhoto = () => {
    setFormData({ ...formData, receipt: null, proof_url: undefined });
    setPreviewUrl(null);
    // Clear the file input
    const fileInput = document.getElementById('receipt') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
  };
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    setLoading(true);
    try {
      let proof_url = formData.proof_url;
      if (formData.receipt) {
        proof_url = await uploadImageToCloudinary(formData.receipt);
      }
      const submitData = { ...formData, proof_url };
      if ('receipt' in submitData) {
        delete submitData.receipt;
      }
      if (editData && formData.id) {
        await updateTransaction(formData.id, submitData);
      } else {
        await addTransaction(submitData);
      }
      resetForm();
      fetchTransactions();
      if (onSuccess) onSuccess();
    } catch {
      // handle error
    } finally {
      setLoading(false);
    }
  };

  return (
  <GlassPanel
    ref={formRef}
    className="p-4 md:p-6 max-h-[80vh] overflow-y-auto w-[94vw] max-w-sm mx-auto md:mx-0 md:w-full md:max-w-lg sm:max-w-md lg:max-w-xl md:rounded-2xl md:max-h-none md:overflow-visible"
  >
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-semibold text-primary">Add Transaction</CardTitle>
      </CardHeader>
      <CardContent className="pb-6 md:pb-4">
        <form onSubmit={handleSubmit} className="space-y-6" encType="multipart/form-data">
          {/* Mobile-first category on top */}
          <div className="md:hidden space-y-2">
            <Label htmlFor="category-mobile">Category</Label>
            <Select
              value={formData.category_id || ''}
              onValueChange={(value) => {
                setFormData({ ...formData, category_id: value });
                if (errors.category_id) setErrors(prev => ({ ...prev, category_id: '' }));
              }}
            >
              <SelectTrigger id="category-mobile" className={`bg-background border ${errors.category_id ? 'border-red-500' : 'border-primary/20'}`}>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {categories
                  .filter((category) => category.type === formData.type)
                  .map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
            {errors.category_id && <p className="text-sm text-red-500">{errors.category_id}</p>}
          </div>
          <div className="grid gap-6 md:gap-5 md:grid-cols-2">
            <div className="flex flex-col gap-4">
              <div className="space-y-2">
                <Label htmlFor="description">Description (Optional)</Label>
                <Input
                  id="description"
                  value={formData.description}
                  onChange={(e) => {
                    setFormData({ ...formData, description: e.target.value });
                  }}
                  className="bg-background border border-primary/20"
                  placeholder="Optional description"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="amount">Amount</Label>
                <CurrencyInput
                  value={formData.amount}
                  onChange={(value) => {
                    setFormData({ ...formData, amount: value });
                    if (errors.amount) setErrors((prev) => ({ ...prev, amount: '' }));
                  }}
                  placeholder="0"
                  className={`bg-background border ${errors.amount ? 'border-red-500' : 'border-primary/20'}`}
                />
                {errors.amount && <p className="text-sm text-red-500">{errors.amount}</p>}
              </div>
              <div className="space-y-2 md:mb-auto">
                <Label htmlFor="type">Type</Label>
                <Select
                  value={formData.type}
                  onValueChange={(value: 'income' | 'expense') => setFormData({ ...formData, type: value })}
                >
                  <SelectTrigger className="bg-background border border-primary/20">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="income">Income</SelectItem>
                    <SelectItem value="expense">Expense</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="date">Date</Label>
                <Input
                  id="date"
                  type="date"
                  value={formData.transaction_date}
                  onChange={(e) => {
                    setFormData({ ...formData, transaction_date: e.target.value });
                    if (errors.date) setErrors((prev) => ({ ...prev, date: '' }));
                  }}
                  className={`bg-background border ${errors.date ? 'border-red-500' : 'border-primary/20'}`}
                />
                {errors.date && <p className="text-sm text-red-500">{errors.date}</p>}
              </div>
            </div>
            <div className="flex flex-col gap-4">
              <div className="space-y-2 hidden md:block">
                <Label htmlFor="category">Category</Label>
                <Select
                  value={formData.category_id || ''}
                  onValueChange={(value) => {
                    setFormData({ ...formData, category_id: value });
                    if (errors.category_id) setErrors(prev => ({ ...prev, category_id: '' }));
                  }}
                >
                  <SelectTrigger className={`bg-background border ${errors.category_id ? 'border-red-500' : 'border-primary/20'}`}>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories
                      .filter((category) => category.type === formData.type)
                      .map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
                {errors.category_id && <p className="text-sm text-red-500">{errors.category_id}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="receipt">Foto Bukti (Opsional)</Label>
                <Input
                  id="receipt"
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0] || null;
                    setFormData({ ...formData, receipt: file });
                    if (file) {
                      const url = URL.createObjectURL(file);
                      setPreviewUrl(url);
                    } else {
                      setPreviewUrl(null);
                    }
                  }}
                />
                {previewUrl && (
                  <div className="mt-2">
                    <div className="relative inline-block">
                      <Image src={previewUrl} alt="Preview" className="max-h-40 rounded border" width={160} height={160} style={{ objectFit: 'contain', maxHeight: '10rem' }} />
                      <Button
                        type="button"
                        className="absolute top-1 right-1 h-6 w-6 p-0 bg-red-500 hover:bg-red-600 text-white border-2 border-white shadow-lg"
                        onClick={handleDeletePhoto}
                        title="Delete photo"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
          <div className="flex justify-end pt-4 pb-2 md:pb-0">
            <Button
              type="submit"
              className="bg-primary text-primary-foreground hover:bg-primary/90 w-full md:w-auto"
              disabled={loading}
              onClick={(e) => {
                e.preventDefault();
                handleSubmit(e);
              }}
            >
              {loading ? 'Saving...' : editData ? 'Update Transaction' : 'Add Transaction'}
            </Button>
          </div>
        </form>
      </CardContent>
    </GlassPanel>
  );
}
