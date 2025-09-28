'use client';

import { useState, useEffect } from 'react';
import { useDataStore } from '@/lib/store/data-store';
import type { Budget } from '@/lib/types';
import { formatCurrency } from '@/lib/utils';
import { Button } from '@/components/ui/button';
// import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CardContent } from '@/components/ui/card';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { CurrencyInput } from '@/components/ui/currency-input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { ProgressBar } from '@/components/ui/progress-bar';
import { PageTransition } from '@/components/ui/page-transition';
import { AnimatedCard } from '@/components/ui/animated-card';
import { Trash2, Plus } from 'lucide-react';
import PlexusBackground from '@/components/PlexusBackground';

export default function BudgetsPage() {
  const { 
    budgets, 
    categories,
    transactions,
    fetchBudgets,
    fetchCategories,
    fetchTransactions,
    addBudget,
    updateBudget,
    deleteBudget,
    loading 
  } = useDataStore();
  
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [currentBudget, setCurrentBudget] = useState<Budget | null>(null);
  const [formData, setFormData] = useState({
    category_id: '',
    amount: 0,
    month: new Date().getMonth() + 1, // Current month (1-12)
    year: new Date().getFullYear(),   // Current year
  });
  const [deleteId, setDeleteId] = useState<string | null>(null);

  useEffect(() => {
    fetchBudgets();
    fetchCategories();
    fetchTransactions();
  }, [fetchBudgets, fetchCategories, fetchTransactions]);

  // Calculate expenses for each budget
  const getBudgetExpense = (budget: Budget) => {
    const budgetTransactions = transactions.filter(t => 
      t.category_id === budget.category_id &&
      new Date(t.transaction_date).getMonth() + 1 === budget.month &&
      new Date(t.transaction_date).getFullYear() === budget.year &&
      t.type === 'expense'
    );
    
    return budgetTransactions.reduce((sum, t) => sum + t.amount, 0);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!formData.category_id) {
      alert('Please select a category');
      return;
    }
    if (formData.amount <= 0) {
      alert('Please enter a valid budget amount');
      return;
    }
    
    try {
      if (currentBudget) {
        // Update existing budget
        await updateBudget(currentBudget.id, formData);
      } else {
        // Create new budget
        await addBudget(formData);
      }
      
      // Reset form and close dialog
      resetForm();
      setIsDialogOpen(false);
    } catch (error) {
      console.error('Error saving budget:', error);
      alert('Failed to save budget. Please try again.');
    }
  };

  const handleEdit = (budget: Budget) => {
    setCurrentBudget(budget);
    setFormData({
      category_id: budget.category_id,
      amount: budget.amount,
      month: budget.month,
      year: budget.year,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = () => {
    if (deleteId) {
      deleteBudget(deleteId);
      setIsDeleteDialogOpen(false);
      setDeleteId(null);
    }
  };

  const resetForm = () => {
    setFormData({
      category_id: '',
      amount: 0,
      month: new Date().getMonth() + 1,
      year: new Date().getFullYear(),
    });
    setCurrentBudget(null);
  };

  const openAddDialog = () => {
    resetForm();
    setIsDialogOpen(true);
  };

  // Generate month options (1-12)
  const months = Array.from({ length: 12 }, (_, i) => ({
    value: i + 1,
    label: new Date(0, i).toLocaleString('default', { month: 'long' })
  }));

  // Generate year options (current year and a few before/after)
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 5 }, (_, i) => currentYear - 2 + i);

  return (
    <PageTransition>
      <div className="min-h-screen aurora-background p-4 md:p-6">
        <PlexusBackground />
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 md:mb-6 gap-4">
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">Budgets</h1>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button 
                onClick={openAddDialog}
                className="bg-primary text-primary-foreground hover:bg-primary/90"
              >
                <Plus className="mr-2 h-4 w-4" /> Add Budget
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md bg-card text-foreground">
              <DialogHeader>
                <DialogTitle>
                  {currentBudget ? 'Edit Budget' : 'Add New Budget'}
                </DialogTitle>
                <DialogDescription>
                  {currentBudget 
                    ? 'Update the budget details' 
                    : 'Set a monthly budget for a category'}
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Select 
                  value={formData.category_id || "uncategorized"} 
                  onValueChange={(value) => setFormData({...formData, category_id: value === "uncategorized" ? "" : value})}
                >
                  <SelectTrigger className="bg-background border border-primary/20">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="uncategorized">Select a category</SelectItem>
                    {categories
                      .filter((category) => category.type === 'expense')
                      .map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
                
                <div className="space-y-2">
                  <Label htmlFor="amount">Budget Amount</Label>
                  <CurrencyInput
                    value={formData.amount}
                    onChange={(value) => setFormData({...formData, amount: value})}
                    placeholder="0"
                    className="bg-background border border-primary/20"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="month">Month</Label>
                    <Select 
                      value={formData.month.toString()} 
                      onValueChange={(value) => setFormData({...formData, month: parseInt(value)})}
                    >
                      <SelectTrigger className="bg-background border border-primary/20">
                        <SelectValue placeholder="Select month" />
                      </SelectTrigger>
                      <SelectContent>
                        {months.map((month) => (
                          <SelectItem key={month.value} value={month.value.toString()}>
                            {month.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="year">Year</Label>
                    <Select 
                      value={formData.year.toString()} 
                      onValueChange={(value) => setFormData({...formData, year: parseInt(value)})}
                    >
                      <SelectTrigger className="bg-background border border-primary/20">
                        <SelectValue placeholder="Select year" />
                      </SelectTrigger>
                      <SelectContent>
                        {years.map((year) => (
                          <SelectItem key={year} value={year.toString()}>
                            {year}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="flex justify-end space-x-2 pt-4">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => {
                      setIsDialogOpen(false);
                      resetForm();
                    }}
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="submit" 
                    className="bg-primary text-primary-foreground hover:bg-primary/90"
                    onClick={(e) => {
                      // Fallback click handler in case form submit doesn't work
                      e.preventDefault();
                      handleSubmit(e);
                    }}
                  >
                    {currentBudget ? 'Update' : 'Add'} Budget
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto"></div>
          </div>
        ) : (
          <AnimatedCard title="Budget Overview" description="Track your monthly spending against your budgets">
            <CardContent>
              {budgets.length > 0 ? (
                <div className="space-y-6">
                  {budgets.map((budget) => {
                    const expense = getBudgetExpense(budget);
                    const category = categories.find(c => c.id === budget.category_id);
                    const percentage = budget.amount > 0 ? (expense / budget.amount) * 100 : 0;
                    
                    return (
                      <div 
                        key={budget.id} 
                        className="p-4 card-glass animate-fadeIn"
                      >
                        <div className="flex justify-between items-center mb-2">
                          <h3 className="text-lg font-medium">
                            {category?.name || 'Uncategorized'} - {months[budget.month - 1].label} {budget.year}
                          </h3>
                          <div className="flex space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEdit(budget)}
                            >
                              Edit
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setDeleteId(budget.id);
                                setIsDeleteDialogOpen(true);
                              }}
                              className="text-red-500 hover:text-red-500"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                        
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-muted-foreground">
                            Expenses: {formatCurrency(expense)} / {formatCurrency(budget.amount)}
                          </span>
                          <span className="text-muted-foreground">
                            {percentage.toFixed(0)}%
                          </span>
                        </div>
                        <ProgressBar 
                          value={expense} 
                          max={budget.amount} 
                          showPercentage={false}
                          className="mb-2"
                        />
                        <div className="flex justify-between text-sm">
                          <span className={expense > budget.amount ? 'text-red-500' : 'text-foreground'}>
                            {expense > budget.amount ? 'Over budget' : 'Under budget'}
                          </span>
                          <span className="text-foreground">
                            {formatCurrency(budget.amount - expense)} remaining
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-12">
                  <p className="text-muted-foreground">No budgets yet. Create your first budget!</p>
                </div>
              )}
            </CardContent>
          </AnimatedCard>
        )}

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <AlertDialogContent className="bg-card text-foreground">
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete the budget.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => setDeleteId(null)}>Cancel</AlertDialogCancel>
              <AlertDialogAction 
                onClick={handleDelete}
                className="bg-red-500 hover:bg-red-500/90"
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </PageTransition>
  );
}