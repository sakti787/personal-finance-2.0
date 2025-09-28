'use client';

import { useState, useEffect } from 'react';
import { useDataStore } from '@/lib/store/data-store';
import type { Goal } from '@/lib/types';
import { formatCurrency } from '@/lib/utils';
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

  useEffect(() => {
    fetchGoals();
  }, [fetchGoals]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
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
    }
  };

  const handleAddFundsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (addFundsGoal && fundsToAdd > 0) {
      try {
        await updateGoalAmount(addFundsGoal.id, fundsToAdd);
        setIsAddFundsDialogOpen(false);
        setFundsToAdd(0);
        setAddFundsGoal(null);
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
  };

  const openAddDialog = () => {
    resetForm();
    setIsDialogOpen(true);
  };

  return (
    <PageTransition>
      <div className="p-4 md:p-6">
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
            <DialogContent className="sm:max-w-md bg-card text-foreground">
              <DialogHeader>
                <DialogTitle>
                  {currentGoal ? 'Edit Goal' : 'Add New Goal'}
                </DialogTitle>
                <DialogDescription>
                  {currentGoal 
                    ? 'Update the goal details' 
                    : 'Set a financial goal to track your savings'}
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Goal Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    placeholder="e.g. Emergency Fund, Vacation"
                    required
                    className="bg-background border border-primary/20"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="target_amount">Target Amount</Label>
                  <CurrencyInput
                    value={formData.target_amount}
                    onChange={(value) => setFormData({...formData, target_amount: value})}
                    placeholder="0"
                    className="bg-background border border-primary/20"
                  />
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
                  >
                    {currentGoal ? 'Update' : 'Add'} Goal
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
          <AnimatedCard title="Financial Goals" description="Track your progress toward your financial goals">
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
                        className="p-4 bg-background border border-primary/20 rounded-md flex flex-col animate-fadeIn"
                      >
                        <div className="flex justify-between items-start mb-3">
                          <div className="flex items-center">
                            <PiggyBank className="h-5 w-5 text-primary mr-2" />
                            <h3 className="text-lg font-medium">{goal.name}</h3>
                          </div>
                          <div className="flex space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEdit(goal)}
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
                              className="text-red-500 hover:text-red-500"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                        
                        <div className="mb-3">
                          <div className="flex justify-between text-sm mb-1">
                            <span className="text-muted-foreground">
                              {formatCurrency(goal.current_amount)} / {formatCurrency(goal.target_amount)}
                            </span>
                            <span className="text-muted-foreground">
                              {percentage.toFixed(0)}%
                            </span>
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
                            <span className={percentage >= 100 ? 'text-green-500' : 'text-foreground'}>
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
                              <DialogContent className="sm:max-w-md bg-card text-foreground">
                                <DialogHeader>
                                  <DialogTitle>Add Funds to Goal</DialogTitle>
                                  <DialogDescription>
                                    Add money toward your goal: {goal.name}
                                  </DialogDescription>
                                </DialogHeader>
                                <form onSubmit={handleAddFundsSubmit} className="space-y-4">
                                  <div className="space-y-2">
                                    <Label htmlFor="addFunds">Amount to Add</Label>
                                    <CurrencyInput
                                      value={fundsToAdd}
                                      onChange={setFundsToAdd}
                                      placeholder="0"
                                      className="bg-background border border-primary/20"
                                    />
                                  </div>
                                  
                                  <div className="flex justify-end space-x-2 pt-4">
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
                                    >
                                      Add Funds
                                    </Button>
                                  </div>
                                </form>
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