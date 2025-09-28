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
      <div className="min-h-screen aurora-background px-0 py-4 md:px-6 md:py-6">
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
          <AnimatedCard title="Budget Overview" description="Track your monthly spending against your budgets" className="max-w-none">
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
                        className="px-2 py-4 sm:px-4 sm:py-4 card-glass animate-fadeIn"
                      >
                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-2 gap-2 sm:gap-0">
                          <h3 className="text-base sm:text-lg font-medium truncate">
                            {category?.name || 'Uncategorized'} - {months[budget.month - 1].label} {budget.year}
                          </h3>
                          <div className="flex flex-row sm:flex-col gap-2 sm:gap-1">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEdit(budget)}
                              className="flex-1 sm:flex-none text-xs sm:text-sm px-2 sm:px-3"
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
                              className="flex-1 sm:flex-none text-xs sm:text-sm px-2 sm:px-3 text-red-500 hover:text-red-500 hover:bg-red-50"
                            >
                              <Trash2 className="h-3 w-3 sm:h-4 sm:w-4" />
                              <span className="ml-1 hidden sm:inline">Delete</span>
                            </Button>
                          </div>
                        </div>
                        
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-muted-foreground">
                            Expenses: {formatCurrency(expense)} / {formatCurrency(budget.amount)}
                          </span>
                          <span className="text-muted-foreground hidden sm:inline">
                            {percentage.toFixed(0)}%
                          </span>
                        </div>
                        
                        {/* Persentase di atas progress bar untuk mobile */}
                        <div className="text-center text-sm font-medium text-primary mb-2 sm:hidden">
                          {percentage.toFixed(0)}%
                        </div>
                        
                        <ProgressBar 
                          value={expense} 
                          max={budget.amount} 
                          showPercentage={false}
                          className="mb-2"
                        />
                        <div className="flex flex-col sm:flex-row sm:justify-between text-sm gap-1 sm:gap-0">
                          <span className="text-foreground order-2 sm:order-1">
                            {formatCurrency(budget.amount - expense)} remaining
                          </span>
                          <span className={`order-1 sm:order-2 ${expense > budget.amount ? 'text-red-500' : 'text-foreground'}`}>
                            {expense > budget.amount ? 'Over budget' : 'Under budget'}
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