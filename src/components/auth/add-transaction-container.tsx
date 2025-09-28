import { useState, useEffect } from 'react';
import Image from 'next/image';
import { useDataStore } from '@/lib/store/data-store';
import { uploadImageToCloudinary } from '@/lib/utils/cloudinary';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CurrencyInput } from '@/components/ui/currency-input';

import { TransactionWithCategory } from '@/lib/types';

type AddTransactionContainerProps = {
  onSuccess?: () => void;
  editData?: Partial<TransactionWithCategory> | null;
};

export default function AddTransactionContainer({ onSuccess, editData }: AddTransactionContainerProps) {
  const { categories, addTransaction, fetchTransactions, fetchCategories } = useDataStore();
  useEffect(() => {
    fetchCategories();
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
    if (!formData.description.trim()) newErrors.description = 'Description is required';
    if (formData.amount <= 0) newErrors.amount = 'Amount must be greater than 0';
    if (!formData.transaction_date) newErrors.date = 'Date is required';
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

  const { updateTransaction } = useDataStore();
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
  <div className="bg-card rounded-lg shadow p-6">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-semibold text-primary">Add Transaction</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4" encType="multipart/form-data">
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Input
              id="description"
              value={formData.description}
              onChange={(e) => {
                setFormData({ ...formData, description: e.target.value });
                if (errors.description) setErrors((prev) => ({ ...prev, description: '' }));
              }}
              className={`bg-background border ${errors.description ? 'border-red-500' : 'border-primary/20'}`}
            />
            {errors.description && <p className="text-sm text-red-500">{errors.description}</p>}
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
          <div className="space-y-2">
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
            <Label htmlFor="category">Category</Label>
            <Select
              value={formData.category_id || 'uncategorized'}
              onValueChange={(value) => setFormData({ ...formData, category_id: value === 'uncategorized' ? '' : value })}
            >
              <SelectTrigger className="bg-background border border-primary/20">
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="uncategorized">Uncategorized</SelectItem>
                {categories
                  .filter((category) => category.type === formData.type)
                  .map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
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
                <Image src={previewUrl} alt="Preview" className="max-h-40 rounded border" width={160} height={160} style={{ objectFit: 'contain', maxHeight: '10rem' }} />
              </div>
            )}
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
          <div className="flex justify-end pt-4">
            <Button type="submit" className="bg-primary text-primary-foreground hover:bg-primary/90" disabled={loading}>
              {loading ? 'Saving...' : editData ? 'Update Transaction' : 'Add Transaction'}
            </Button>
          </div>
        </form>
      </CardContent>
    </div>
  );
}
