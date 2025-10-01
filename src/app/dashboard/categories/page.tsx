'use client';

import { useState, useEffect } from 'react';
import { useDataStore } from '@/lib/store/data-store';
import type { Category } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CardContent } from '@/components/ui/card';
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
import { PageTransition } from '@/components/ui/page-transition';
import { AnimatedCard } from '@/components/ui/animated-card';
import { Trash2, Plus } from 'lucide-react';
import PlexusBackground from '@/components/PlexusBackground';
import { GlassPanel } from '@/components/ui/glass-panel';

export default function CategoriesPage() {
  const { 
    categories, 
    fetchCategories,
    addCategory,
    updateCategory,
    deleteCategory,
    loading 
  } = useDataStore();
  
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [currentCategory, setCurrentCategory] = useState<Category | null>(null);
  const [formData, setFormData] = useState({ name: '', type: 'expense' });
  const [deleteId, setDeleteId] = useState<string | null>(null);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!formData.name.trim()) {
      alert('Please enter a category name');
      return;
    }
    
    try {
      const data = {
        name: formData.name,
        type: formData.type as 'income' | 'expense',
      };
      if (currentCategory) {
        await updateCategory(currentCategory.id, data);
      } else {
        await addCategory(data);
      }
      resetForm();
      setIsDialogOpen(false);
    } catch (error) {
      console.error('Error saving category:', error);
      alert('Failed to save category. Please try again.');
    }
  };

  const handleEdit = (category: Category) => {
    setCurrentCategory(category);
    setFormData({ name: category.name, type: category.type || 'expense' });
    setIsDialogOpen(true);
  };

  const handleDelete = () => {
    if (deleteId) {
      deleteCategory(deleteId);
      setIsDeleteDialogOpen(false);
      setDeleteId(null);
    }
  };

  const resetForm = () => {
    setFormData({ name: '', type: 'expense' });
    setCurrentCategory(null);
  };

  const openAddDialog = () => {
    resetForm();
    setIsDialogOpen(true);
  };

  // (Removed legacy body scroll lock; layout refactor restored stable fixed dialogs.)

  return (
    <PageTransition>
      <div className="min-h-screen aurora-background p-4 md:p-6">
        <PlexusBackground />
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 md:mb-6 gap-4">
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">Categories</h1>
          <Dialog open={isDialogOpen} onOpenChange={(open) => {
            setIsDialogOpen(open);
            if (!open) {
              setCurrentCategory(null);
              setFormData({ name: '', type: 'expense' });
            }
          }}>
            <DialogTrigger asChild>
              <Button 
                onClick={openAddDialog}
                className="bg-primary text-primary-foreground hover:bg-primary/90"
              >
                <Plus className="mr-2 h-4 w-4" /> Add Category
              </Button>
            </DialogTrigger>
            <DialogContent transparent className="p-0">
              <GlassPanel className="p-5 md:p-6 w-[94vw] max-w-sm mx-auto sm:mx-0 sm:w-full sm:max-w-md md:max-w-lg md:rounded-2xl max-h-[80vh] overflow-y-auto">
                <DialogHeader className="pb-2">
                  <DialogTitle className="text-lg font-semibold text-primary">
                    {currentCategory ? 'Edit Category' : 'Add New Category'}
                  </DialogTitle>
                  <DialogDescription className="text-xs sm:text-sm opacity-80">
                    {currentCategory
                      ? 'Update the category details'
                      : 'Create a custom category to organize your transactions'}
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="space-y-2">
                    <Label htmlFor="name">Category Name</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="e.g. Food, Transportation, Salary"
                      required
                      className="bg-background border border-primary/20"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="type">Type</Label>
                    <select
                      id="type"
                      value={formData.type}
                      onChange={(e) => setFormData({ ...formData, type: e.target.value as 'income' | 'expense' })}
                      className="bg-background border border-primary/20 rounded px-3 py-2 w-full"
                    >
                      <option value="income">Income</option>
                      <option value="expense">Expense</option>
                    </select>
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
                        e.preventDefault();
                        handleSubmit(e);
                      }}
                    >
                      {currentCategory ? 'Update' : 'Add'} Category
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
          <AnimatedCard title="Category List" description="All your custom categories for organizing transactions">
            <CardContent>
              {categories.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {[...categories]
                    .sort((a, b) => (a.type === b.type ? 0 : a.type === 'expense' ? -1 : 1))
                    .map((category) => (
                      <div 
                        key={category.id} 
                        className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-4 card-glass gap-2 sm:gap-0"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                          <span className="text-foreground font-medium">{category.name}</span>
                          <span className={`px-2 py-0.5 rounded text-xs self-start sm:self-auto ${category.type === 'income' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>{category.type.charAt(0).toUpperCase() + category.type.slice(1)}</span>
                        </div>
                        <div className="flex flex-row sm:flex-col gap-2 sm:gap-1">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEdit(category)}
                            className="flex-1 sm:flex-none text-xs sm:text-sm px-2 sm:px-3"
                          >
                            Edit
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setDeleteId(category.id);
                              setIsDeleteDialogOpen(true);
                            }}
                            className="flex-1 sm:flex-none text-xs sm:text-sm px-2 sm:px-3 text-red-500 hover:text-red-500 hover:bg-red-50"
                          >
                            <Trash2 className="h-3 w-3 sm:h-4 sm:w-4" />
                            <span className="ml-1 hidden sm:inline">Delete</span>
                          </Button>
                        </div>
                      </div>
                    ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <p className="text-muted-foreground">No categories yet. Add your first category!</p>
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
                This action cannot be undone. This will permanently delete the category.
                All transactions associated with this category will be updated to &apos;Uncategorized&apos;.
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