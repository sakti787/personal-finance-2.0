'use client';

import { useState, useEffect } from 'react';
import { useDataStore } from '@/lib/store/data-store';
import type { Goal } from '@/lib/types';
import { formatCurrency } from '@/lib/utils';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CardContent } from '@/components/ui/card';
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
import { Trash2, Plus, PiggyBank } from 'lucide-react';
import PlexusBackground from '@/components/PlexusBackground';
import { GlassPanel } from '@/components/ui/glass-panel';

export default function GoalsPage() {
  const { 
    goals, 
    fetchGoals,
    addGoal,
    updateGoal,
    updateGoalAmount,
    deleteGoal,
    loading 
  } = useDataStore();
  
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isAddFundsDialogOpen, setIsAddFundsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [currentGoal, setCurrentGoal] = useState<Goal | null>(null);
  const [addFundsGoal, setAddFundsGoal] = useState<Goal | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    target_amount: 0,
  });
  const [fundsToAdd, setFundsToAdd] = useState(0);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [errors, setErrors] = useState<{ name?: string; target_amount?: string; fundsToAdd?: string }>({});

  useEffect(() => {
    fetchGoals();
  }, [fetchGoals]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: { name?: string; target_amount?: string } = {};
    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (formData.target_amount <= 0) newErrors.target_amount = 'Amount must be greater than 0';
    setErrors(prev => ({ ...prev, ...newErrors }));
    if (Object.keys(newErrors).length) return;
    
    try {
      if (currentGoal) {
        // Update existing goal
        await updateGoal(currentGoal.id, formData);
      } else {
        // Create new goal
        await addGoal({ ...formData, current_amount: 0 });
      }
      
      // Reset form and close dialog
      resetForm();
      setIsDialogOpen(false);
    } catch (error) {
      console.error('Error saving goal:', error);
      // Optionally set a generic error state
    }
  };

  const handleAddFundsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: { fundsToAdd?: string } = {};
    if (fundsToAdd <= 0) newErrors.fundsToAdd = 'Amount must be greater than 0';
    setErrors(prev => ({ ...prev, ...newErrors }));
    if (Object.keys(newErrors).length) return;
    if (addFundsGoal) {
      try {
        await updateGoalAmount(addFundsGoal.id, fundsToAdd);
        setIsAddFundsDialogOpen(false);
        setFundsToAdd(0);
        setAddFundsGoal(null);
        setErrors(prev => ({ ...prev, fundsToAdd: undefined }));
      } catch (error) {
        console.error('Error adding funds to goal:', error);
      }
    }
  };

  const handleEdit = (goal: Goal) => {
    setCurrentGoal(goal);
    setFormData({
      name: goal.name,
      target_amount: goal.target_amount,
    });
    setIsDialogOpen(true);
  };

  const handleAddFunds = (goal: Goal) => {
    setAddFundsGoal(goal);
    setFundsToAdd(0);
    setIsAddFundsDialogOpen(true);
  };

  const handleDelete = () => {
    if (deleteId) {
      deleteGoal(deleteId);
      setIsDeleteDialogOpen(false);
      setDeleteId(null);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      target_amount: 0,
    });
    setCurrentGoal(null);
    setErrors(prev => ({ ...prev, name: undefined, target_amount: undefined }));
  };

  const openAddDialog = () => {
    resetForm();
    setIsDialogOpen(true);
  };

  return (
    <PageTransition>
      <div className="min-h-screen aurora-background px-0 py-4 md:px-6 md:py-6">
        <PlexusBackground />
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 md:mb-6 gap-4">
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">Financial Goals</h1>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button 
                onClick={openAddDialog}
                className="bg-primary text-primary-foreground hover:bg-primary/90"
              >
                <Plus className="mr-2 h-4 w-4" /> Add Goal
              </Button>
            </DialogTrigger>
            <DialogContent transparent className="p-0">
              <GlassPanel className="p-5 md:p-6 w-[94vw] max-w-sm mx-auto sm:mx-0 sm:w-full sm:max-w-md md:rounded-2xl max-h-[80vh] overflow-y-auto">
                <DialogHeader className="pb-2">
                  <DialogTitle className="text-lg font-semibold text-primary">
                    {currentGoal ? 'Edit Goal' : 'Add New Goal'}
                  </DialogTitle>
                  <DialogDescription className="text-xs sm:text-sm opacity-80">
                    {currentGoal 
                      ? 'Update the goal details' 
                      : 'Set a financial goal to track your savings'}
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="space-y-2">
                  <Label htmlFor="name">Goal Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => {
                      setFormData({...formData, name: e.target.value});
                      if (errors.name) setErrors(prev => ({ ...prev, name: undefined }));
                    }}
                    placeholder="e.g. Emergency Fund, Vacation"
                    required
                    className={cn(
                      'bg-background border',
                      errors.name ? 'border-red-500' : 'border-primary/20'
                    )}
                  />
                    {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
                  </div>
                  <div className="space-y-2">
                  <Label htmlFor="target_amount">Target Amount</Label>
                  <CurrencyInput
                    value={formData.target_amount}
                    onChange={(value) => {
                      setFormData({...formData, target_amount: value});
                      if (errors.target_amount) setErrors(prev => ({ ...prev, target_amount: undefined }));
                    }}
                    placeholder="0"
                    className={cn(
                      'bg-background border',
                      errors.target_amount ? 'border-red-500' : 'border-primary/20'
                    )}
                  />
                    {errors.target_amount && <p className="text-sm text-red-500">{errors.target_amount}</p>}
                  </div>
                  <div className="flex justify-end gap-2 pt-2">
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
                    {currentGoal ? 'Update' : 'Add'} Goal
                  </Button>
                  </div>
                </form>
              </GlassPanel>
            </DialogContent>
          </Dialog>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto"></div>
          </div>
        ) : (
          <AnimatedCard title="Financial Goals" description="Track your progress toward your financial goals" className="max-w-none">
            <CardContent>
              {goals.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {goals.map((goal) => {
                    const percentage = goal.target_amount > 0 
                      ? (goal.current_amount / goal.target_amount) * 100 
                      : 0;
                    
                    return (
                      <div 
                        key={goal.id} 
                        className="p-4 card-glass flex flex-col animate-fadeIn"
                      >
                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-3 gap-2 sm:gap-0">
                          <div className="flex items-center">
                            <PiggyBank className="h-5 w-5 text-primary mr-2 flex-shrink-0" />
                            <h3 className="text-lg font-medium truncate">{goal.name}</h3>
                          </div>
                          <div className="flex flex-row sm:flex-col gap-2 sm:gap-1">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEdit(goal)}
                              className="flex-1 sm:flex-none text-xs sm:text-sm px-2 sm:px-3"
                            >
                              Edit
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setDeleteId(goal.id);
                                setIsDeleteDialogOpen(true);
                              }}
                              className="flex-1 sm:flex-none text-xs sm:text-sm px-2 sm:px-3 text-red-500 hover:text-red-500 hover:bg-red-50"
                            >
                              <Trash2 className="h-3 w-3 sm:h-4 sm:w-4" />
                              <span className="ml-1 hidden sm:inline">Delete</span>
                            </Button>
                          </div>
                        </div>
                        
                        <div className="mb-3">
                          <div className="flex justify-between text-sm mb-1">
                            <span className="text-muted-foreground">
                              {formatCurrency(goal.current_amount)} / {formatCurrency(goal.target_amount)}
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
                            value={goal.current_amount} 
                            max={goal.target_amount} 
                            showPercentage={false}
                            className="mb-2"
                          />
                        </div>
                        
                        <div className="mt-auto">
                          <div className="flex justify-between text-sm mb-3">
                            <span className="text-green-500">
                              {formatCurrency(goal.target_amount - goal.current_amount)} to go
                            </span>
                            <span className={`hidden sm:inline ${percentage >= 100 ? 'text-green-500' : 'text-foreground'}`}>
                              {percentage >= 100 ? 'Goal achieved!' : 'Save more'}
                            </span>
                          </div>
                          
                          <div className="text-center text-sm mb-2 sm:hidden">
                            <span className={percentage >= 100 ? 'text-green-500 font-medium' : 'text-foreground'}>
                              {percentage >= 100 ? 'Goal achieved!' : 'Save more'}
                            </span>
                          </div>
                          
                          <div className="flex space-x-2">
                            <Dialog open={isAddFundsDialogOpen} onOpenChange={setIsAddFundsDialogOpen}>
                              <DialogTrigger asChild>
                                <Button 
                                  size="sm" 
                                  variant="outline"
                                  onClick={() => handleAddFunds(goal)}
                                  className="flex-1"
                                >
                                  Add Funds
                                </Button>
                              </DialogTrigger>
                              <DialogContent transparent className="p-0">
                                <GlassPanel className="p-5 md:p-6 w-[94vw] max-w-sm mx-auto sm:mx-0 sm:w-full sm:max-w-md md:rounded-2xl max-h-[70vh] overflow-y-auto">
                                  <DialogHeader className="pb-2">
                                    <DialogTitle className="text-lg font-semibold text-primary">Add Funds to Goal</DialogTitle>
                                    <DialogDescription className="text-xs sm:text-sm opacity-80">
                                      Add money toward your goal: {goal.name}
                                    </DialogDescription>
                                  </DialogHeader>
                                  <form onSubmit={handleAddFundsSubmit} className="space-y-5">
                                    <div className="space-y-2">
                                    <Label htmlFor="addFunds">Amount to Add</Label>
                                    <CurrencyInput
                                      value={fundsToAdd}
                                      onChange={(v) => {
                                        setFundsToAdd(v);
                                        if (errors.fundsToAdd) setErrors(prev => ({ ...prev, fundsToAdd: undefined }));
                                      }}
                                      placeholder="0"
                                      className={cn(
                                        'bg-background border',
                                        errors.fundsToAdd ? 'border-red-500' : 'border-primary/20'
                                      )}
                                    />
                                      {errors.fundsToAdd && <p className="text-sm text-red-500">{errors.fundsToAdd}</p>}
                                    </div>
                                    <div className="flex justify-end gap-2 pt-2">
                                    <Button 
                                      type="button" 
                                      variant="outline" 
                                      onClick={() => {
                                        setIsAddFundsDialogOpen(false);
                                        setFundsToAdd(0);
                                        setAddFundsGoal(null);
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
                                        handleAddFundsSubmit(e);
                                      }}
                                    >
                                      Add Funds
                                    </Button>
                                    </div>
                                  </form>
                                </GlassPanel>
                              </DialogContent>
                            </Dialog>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-12">
                  <PiggyBank className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No financial goals yet. Set your first goal!</p>
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
                This action cannot be undone. This will permanently delete the financial goal.
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